import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma";

async function main() {
  const email = "alex@northline.studio";
  const passwordHash = await bcrypt.hash("NorthlineDemo123", 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "Alex Morgan",
      passwordHash
    }
  });

  const wallet = await prisma.wallet.upsert({
    where: { slug: "evergreen-dental" },
    update: {},
    create: {
      slug: "evergreen-dental",
      name: "Evergreen Dental Wallet",
      businessName: "Evergreen Dental Studio",
      websiteUrl: "https://evergreendental.com",
      ownerContactName: "Maya Bennett",
      ownerEmail: "maya@evergreendental.com",
      timezone: "America/Chicago",
      planTier: "Growth",
      status: "IN_SETUP",
      handoffStatus: "OWNER_INVITED",
      ownerAcceptanceStatus: "PENDING",
      setupStatus: "PROVIDERS_ADDED",
      createdById: user.id,
      primaryDeveloperId: user.id,
      memberships: {
        create: {
          userId: user.id,
          role: "DEVELOPER",
          status: "ACTIVE",
          isPrimaryDeveloper: true,
          joinedAt: new Date()
        }
      }
    }
  });

  const website = await prisma.website.upsert({
    where: {
      walletId_name: {
        walletId: wallet.id,
        name: "Evergreen Dental"
      }
    },
    update: {},
    create: {
      walletId: wallet.id,
      name: "Evergreen Dental",
      primaryDomain: "evergreendental.com",
      productionUrl: "https://evergreendental.com",
      stagingUrl: "https://staging.evergreendental.com",
      siteCategory: "Healthcare",
      framework: "Next.js + Supabase + Builder.io",
      status: "LIVE"
    }
  });

  const providerTemplate = await prisma.providerTemplate.upsert({
    where: { slug: "builder-io" },
    update: {},
    create: {
      slug: "builder-io",
      displayName: "Builder.io",
      category: "CMS",
      connectionMethods: ["MANUAL", "OAUTH", "API_TOKEN"],
      defaultDescription: "Website content editing",
      defaultOwnerLabel: "Website content editing"
    }
  });

  await prisma.providerConnection.createMany({
    data: [
      {
        walletId: wallet.id,
        websiteId: website.id,
        providerTemplateId: providerTemplate.id,
        providerName: "Builder.io",
        displayLabel: "Website content editing",
        category: "CMS",
        status: "CONNECTED",
        healthStatus: "ATTENTION_NEEDED",
        syncState: "DISABLED",
        connectedAccountLabel: "Evergreen Content Space",
        dashboardUrl: "https://builder.io/content",
        editUrl: "https://builder.io/content",
        ownerDescription: "This is where page content and updates are managed.",
        connectionMethod: "MANUAL",
        monthlyCostEstimate: new Prisma.Decimal(95)
      }
    ],
    skipDuplicates: true
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
