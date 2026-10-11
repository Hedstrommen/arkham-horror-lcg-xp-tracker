import { Request, Response, Router } from "express";
import { CreateCampaignHandler } from "../../application/use-cases/create-campaign/create-campaign-handler";
import { GainExperienceHandler } from "../../application/use-cases/gain-experience/gain-experience-handler";
import { ListCampaignsHandler } from "../../application/use-cases/list-campaigns/list-campaigns-handler";
import { CampaignRepository } from "../../domain/campaign/campaign-repository";
import { ArkhamCatalog } from "../../application/ports/arkham-catalog";
import { ChangeCampaignStatusHandler } from "../../application/use-cases/change-campaign-status/change-campaign-status-handler";
import { CampaignStatusChange } from "../../application/use-cases/change-campaign-status/change-campaign-status-command";
import { renderOverviewPage } from "../views/overview-view";
import { renderCreateCampaignPage } from "../views/create-campaign-view";
import { renderGainExperiencePage } from "../views/gain-experience-view";
import { getSessionId } from "../auth/current-user";

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
  campaignRepository: CampaignRepository,
  arkhamCatalog: ArkhamCatalog,
  changeCampaignStatusHandler: ChangeCampaignStatusHandler,
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
    const friendsInput = typeof request.body.friends === "string"
      ? request.body.friends
      : "";
    const previouslyEnteredTitle =
      typeof request.body.title === "string" ? request.body.title : "";
    const friends: string[] = friendsInput
      .split(",")
      .map((friend: string) => friend.trim())
      .filter((friend: string) => friend.length > 0);

    try {
      createCampaignHandler.handle({
        ownerId,
        title: String(request.body.title ?? ""),
        campaignName: String(request.body.campaignName ?? ""),
        friends,
        investigatorId: String(request.body.investigatorId ?? ""),
      });
      response.redirect("/");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      response.status(400).send(
        renderCreateCampaignPage(
          arkhamCatalog.listCampaigns(),
          arkhamCatalog.listInvestigators(),
          errorMessage,
          previouslyEnteredTitle
        )
      );
    }
  });

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

      try {
        gainExperienceHandler.handle({
          campaignId: campaign.id,
          ownerId,
          experienceKind: String(request.body.experienceKind ?? ""),
          experienceAmount: Number(request.body.experienceAmount),
          notes: notesInput.length > 0 ? notesInput : null,
        });
        response.redirect("/");
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
