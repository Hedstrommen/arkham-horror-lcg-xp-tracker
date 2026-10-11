import { Request, Response, Router } from "express";
import { CreateCampaignHandler } from "../../application/use-cases/create-campaign/create-campaign-handler";
import { GainExperienceHandler } from "../../application/use-cases/gain-experience/gain-experience-handler";
import { ListCampaignsHandler } from "../../application/use-cases/list-campaigns/list-campaigns-handler";
import { CampaignRepository } from "../../domain/campaign/campaign-repository";
import { ArkhamCatalog } from "../../application/ports/arkham-catalog";
import { renderOverviewPage } from "../views/overview-view";
import { renderCreateCampaignPage } from "../views/create-campaign-view";
import { renderGainExperiencePage } from "../views/gain-experience-view";

export function createCampaignRoutes(
  listCampaignsHandler: ListCampaignsHandler,
  createCampaignHandler: CreateCampaignHandler,
  gainExperienceHandler: GainExperienceHandler,
  campaignRepository: CampaignRepository,
  arkhamCatalog: ArkhamCatalog
): Router {
  const router = Router();

  router.get("/", (request: Request, response: Response) => {
    const campaigns = listCampaignsHandler.handle();
    response.send(renderOverviewPage(campaigns));
  });

  router.get("/campaigns/new", (request: Request, response: Response) => {
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
    const friendsInput = typeof request.body.friends === "string"
      ? request.body.friends
      : "";
    const friends = friendsInput
      .split(",")
      .map((friend) => friend.trim())
      .filter((friend) => friend.length > 0);

    try {
      const campaignId = createCampaignHandler.handle({
        title: request.body.title ?? "",
        campaignName: request.body.campaignName ?? "",
        friends,
        investigatorId: request.body.investigatorId ?? "",
      });
      response.redirect("/");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      response.status(400).send(
        renderCreateCampaignPage(
          arkhamCatalog.listCampaigns(),
          arkhamCatalog.listInvestigators(),
          errorMessage,
          typeof request.body.title === "string" ? request.body.title : ""
        )
      );
    }
  });

  router.get(
    "/campaigns/:campaignId/gain-experience",
    (request: Request, response: Response) => {
      const campaign = campaignRepository.findById(request.params.campaignId);
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
      const campaign = campaignRepository.findById(request.params.campaignId);
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
          experienceKind: request.body.experienceKind ?? "",
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

  return router;
}
