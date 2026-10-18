import { Request, Response, Router } from "express";
import { CreateCampaignHandler } from "../../application/use-cases/create-campaign/create-campaign-handler";
import { GainExperienceHandler } from "../../application/use-cases/gain-experience/gain-experience-handler";
import { UpdateExperienceHandler } from "../../application/use-cases/update-experience/update-experience-handler";
import { UpdateCampaignHandler } from "../../application/use-cases/update-campaign/update-campaign-handler";
import { DeleteCampaignHandler } from "../../application/use-cases/delete-campaign/delete-campaign-handler";
import { renderCampaignDetailPage } from "../views/campaign-detail-view";
import { ListCampaignsHandler } from "../../application/use-cases/list-campaigns/list-campaigns-handler";
import { CampaignRepository } from "../../domain/campaign/campaign-repository";
import { ArkhamCatalog } from "../../application/ports/arkham-catalog";
import { ChangeCampaignStatusHandler } from "../../application/use-cases/change-campaign-status/change-campaign-status-handler";
import { CampaignStatusChange } from "../../application/use-cases/change-campaign-status/change-campaign-status-command";
import { renderOverviewPage } from "../views/overview-view";
import { renderCreateCampaignPage } from "../views/create-campaign-view";
import { renderGainExperiencePage } from "../views/gain-experience-view";
import { getSessionId } from "../auth/current-user";
import { Friend } from "../../domain/value-objects/friend";
import { parseFriend } from "../../domain/value-objects/friend";

function parseFriendsInput(rawNames: unknown, rawInvestigators: unknown): Friend[] {
  const names = Array.isArray(rawNames) ? rawNames.map(String) : [];
  const investigatorIds = Array.isArray(rawInvestigators) ? rawInvestigators.map(String) : [];
  const friendList: Friend[] = [];
  names.forEach((name, index) => {
    const investigatorId = investigatorIds[index] ?? "";
    friendList.push(parseFriend({ name, investigatorId: investigatorId === "" ? null : investigatorId }));
  });
  const seenNames = new Set<string>();
  const friends: Friend[] = [];
  for (const friend of friendList) {
    if (seenNames.has(friend.name)) {
      continue;
    }
    seenNames.add(friend.name);
    friends.push(friend);
  }
  return friends;
}

function parseFriendAmountsInput(
  rawFriendNames: unknown,
  rawFriendAmounts: unknown,
  knownFriends: Friend[]
): Record<string, number> {
  const names = Array.isArray(rawFriendNames) ? rawFriendNames.map(String) : [];
  const amounts = Array.isArray(rawFriendAmounts) ? rawFriendAmounts.map(String) : [];
  const knownNames = new Set(knownFriends.map((friend) => friend.name));
  const friendAmounts: Record<string, number> = {};
  names.forEach((name, index) => {
    const rawAmount = (amounts[index] ?? "").trim();
    if (rawAmount.length === 0 || !knownNames.has(name)) {
      return;
    }
    const amount = Number(rawAmount);
    if (!Number.isInteger(amount) || amount < 0) {
      throw new Error(`Experience for ${name} must be a non-negative whole number.`);
    }
    friendAmounts[name] = amount;
  });
  return friendAmounts;
}

const VALID_STATUS_CHANGES: CampaignStatusChange[] = ["finish", "reactivate"];

function parseStatusChange(rawValue: unknown): CampaignStatusChange {
  const value = String(rawValue ?? "");
  if (!VALID_STATUS_CHANGES.includes(value as CampaignStatusChange)) {
    throw new Error(
      `Status change must be one of: ${VALID_STATUS_CHANGES.join(", ")}.`
    );
  }
  return value as CampaignStatusChange;
}

export function createCampaignRoutes(
  listCampaignsHandler: ListCampaignsHandler,
  createCampaignHandler: CreateCampaignHandler,
  gainExperienceHandler: GainExperienceHandler,
  updateExperienceHandler: UpdateExperienceHandler,
  campaignRepository: CampaignRepository,
  arkhamCatalog: ArkhamCatalog,
  changeCampaignStatusHandler: ChangeCampaignStatusHandler,
  updateCampaignHandler: UpdateCampaignHandler,
  deleteCampaignHandler: DeleteCampaignHandler,
  requireSignedInUser: (
    request: Request,
    response: Response
  ) => string | null
): Router {
  const router = Router();

  router.get("/", (request: Request, response: Response) => {
    const ownerId = requireSignedInUser(request, response);
    if (ownerId === null) {
      return;
    }
    const campaigns = listCampaignsHandler.handle(ownerId);
    response.send(renderOverviewPage(campaigns));
  });

  router.get("/campaigns/new", (request: Request, response: Response) => {
    const ownerId = requireSignedInUser(request, response);
    if (ownerId === null) {
      return;
    }
    response.send(
      renderCreateCampaignPage(
        arkhamCatalog.listCampaigns(),
        arkhamCatalog.listInvestigators(),
        null,
        ""
      )
    );
  });

  router.post("/campaigns", (request: Request, response: Response) => {
    const ownerId = requireSignedInUser(request, response);
    if (ownerId === null) {
      return;
    }
    const notesInput = typeof request.body.notes === "string"
      ? request.body.notes.trim()
      : "";

    try {
      const friends = parseFriendsInput(request.body.friendNames, request.body.friendInvestigators);
      for (const friend of friends) {
        const investigator = friend.investigatorId === null
          ? null
          : arkhamCatalog.findInvestigatorById(friend.investigatorId);
        if (friend.investigatorId !== null && investigator === null) {
          throw new Error(`Unknown investigator: ${friend.investigatorId}`);
        }
        friend.investigatorName = investigator === null ? null : investigator.investigatorName;
        friend.investigatorFaction = investigator === null ? null : investigator.factionName;
      }
      const chapterNumber = Number(request.body.chapter);
      const titleInput = typeof request.body.title === "string"
        ? request.body.title.trim()
        : "";
      createCampaignHandler.handle({
        ownerId,
        title: titleInput.length > 0 ? titleInput : null,
        campaignName: String(request.body.campaignName ?? ""),
        chapter: chapterNumber === 2 ? 2 : 1,
        friends,
        investigatorId: String(request.body.investigatorId ?? ""),
        notes: notesInput.length > 0 ? notesInput : null,
      });
      response.redirect("/");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      response.status(400).send(
        renderCreateCampaignPage(
          arkhamCatalog.listCampaigns(),
          arkhamCatalog.listInvestigators(),
          errorMessage,
          ""
        )
      );
    }
  });

  router.get("/campaigns/:campaignId", (request: Request, response: Response) => {
    const ownerId = requireSignedInUser(request, response);
    if (ownerId === null) {
      return;
    }
    const campaign = campaignRepository.findByIdAndOwnerId(
      String(request.params.campaignId),
      ownerId
    );
    if (campaign === null) {
      response.status(404).send("Campaign not found.");
      return;
    }
    const editMode = request.query.edit === "1";
    response.send(renderCampaignDetailPage(campaign, arkhamCatalog.listInvestigators(), editMode));
  });

  router.post(
    "/campaigns/:campaignId/edit",
    (request: Request, response: Response) => {
      const ownerId = requireSignedInUser(request, response);
      if (ownerId === null) {
        return;
      }
      const friends = parseFriendsInput(request.body.friendNames, request.body.friendInvestigators);
      for (const friend of friends) {
        const investigator = friend.investigatorId === null
          ? null
          : arkhamCatalog.findInvestigatorById(friend.investigatorId);
        if (friend.investigatorId !== null && investigator === null) {
          throw new Error(`Unknown investigator: ${friend.investigatorId}`);
        }
        friend.investigatorName = investigator === null ? null : investigator.investigatorName;
        friend.investigatorFaction = investigator === null ? null : investigator.factionName;
      }
      const notesInput = typeof request.body.notes === "string"
        ? request.body.notes.trim()
        : "";

      try {
        updateCampaignHandler.handle({
          campaignId: String(request.params.campaignId),
          ownerId,
          title: String(request.body.title ?? ""),
          friends,
          notes: notesInput.length > 0 ? notesInput : null,
        });
        response.redirect(`/campaigns/${String(request.params.campaignId)}`);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        const campaign = campaignRepository.findByIdAndOwnerId(
          String(request.params.campaignId),
          ownerId
        );
        if (campaign === null) {
          response.status(404).send("Campaign not found.");
          return;
        }
        response.status(400).send(renderCampaignDetailPage(campaign, arkhamCatalog.listInvestigators()));
      }
    }
  );

  router.post(
    "/campaigns/:campaignId/delete",
    (request: Request, response: Response) => {
      const ownerId = requireSignedInUser(request, response);
      if (ownerId === null) {
        return;
      }
      try {
        deleteCampaignHandler.handle({
          campaignId: String(request.params.campaignId),
          ownerId,
        });
      } catch (error) {
        console.error(error);
      }
      response.redirect("/");
    }
  );

  router.get(
    "/campaigns/:campaignId/gain-experience",
    (request: Request, response: Response) => {
      const ownerId = requireSignedInUser(request, response);
      if (ownerId === null) {
        return;
      }
      const campaign = campaignRepository.findByIdAndOwnerId(
        String(request.params.campaignId),
        ownerId
      );
      if (campaign === null) {
        response.status(404).send("Campaign not found.");
        return;
      }
      response.send(renderGainExperiencePage(campaign, null));
    }
  );

  router.post(
    "/campaigns/:campaignId/gain-experience",
    (request: Request, response: Response) => {
      const ownerId = requireSignedInUser(request, response);
      if (ownerId === null) {
        return;
      }
      const campaign = campaignRepository.findByIdAndOwnerId(
        String(request.params.campaignId),
        ownerId
      );
      if (campaign === null) {
        response.status(404).send("Campaign not found.");
        return;
      }

      const notesInput = typeof request.body.notes === "string"
        ? request.body.notes.trim()
        : "";
      const titleInput = typeof request.body.experienceTitle === "string"
        ? request.body.experienceTitle.trim()
        : "";

      try {
        gainExperienceHandler.handle({
          campaignId: campaign.id,
          ownerId,
          experienceKind: String(request.body.experienceKind ?? ""),
          experienceAmount: Number(request.body.experienceAmount),
          experienceTitle: titleInput,
          notes: notesInput.length > 0 ? notesInput : null,
          friendAmounts: parseFriendAmountsInput(
            request.body.friendNames,
            request.body.friendAmounts,
            campaign.friends
          ),
        });
        response.redirect(`/campaigns/${campaign.id}`);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        response.status(400).send(renderGainExperiencePage(campaign, errorMessage));
      }
    }
  );

  router.post(
    "/campaigns/:campaignId/experience/:entryId",
    (request: Request, response: Response) => {
      const ownerId = requireSignedInUser(request, response);
      if (ownerId === null) {
        return;
      }
      const campaign = campaignRepository.findByIdAndOwnerId(
        String(request.params.campaignId),
        ownerId
      );
      if (campaign === null) {
        response.status(404).send("Campaign not found.");
        return;
      }

      const notesInput = typeof request.body.notes === "string"
        ? request.body.notes.trim()
        : "";
      const titleInput = typeof request.body.experienceTitle === "string"
        ? request.body.experienceTitle.trim()
        : "";

      try {
        updateExperienceHandler.handle({
          campaignId: campaign.id,
          ownerId,
          entryId: String(request.params.entryId),
          experienceKind: String(request.body.experienceKind ?? ""),
          experienceAmount: Number(request.body.experienceAmount),
          experienceTitle: titleInput,
          notes: notesInput.length > 0 ? notesInput : null,
          friendAmounts: parseFriendAmountsInput(
            request.body.friendNames,
            request.body.friendAmounts,
            campaign.friends
          ),
        });
        response.redirect(`/campaigns/${campaign.id}/gain-experience`);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        response.status(400).send(renderGainExperiencePage(campaign, errorMessage));
      }
    }
  );

  router.post(
    "/campaigns/:campaignId/status",
    (request: Request, response: Response) => {
      const ownerId = requireSignedInUser(request, response);
      if (ownerId === null) {
        return;
      }
      try {
        changeCampaignStatusHandler.handle({
          campaignId: String(request.params.campaignId),
          ownerId,
          statusChange: parseStatusChange(request.body.statusChange),
        });
      } catch (error) {
        console.error(error);
      }
      response.redirect("/");
    }
  );

  return router;
}

export function createRequireSignedInUser(
  sessionStore: { findUserIdBySessionId(sessionId: string): string | null }
): (request: Request, response: Response) => string | null {
  return (request: Request, response: Response): string | null => {
    const sessionId = getSessionId(request);
    const userId =
      sessionId === null ? null : sessionStore.findUserIdBySessionId(sessionId);
    if (userId === null) {
      response.redirect("/auth/sign-in");
      return null;
    }
    return userId;
  };
}
