"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@ieee/ui/components/tabs";
import { RegistrationForm } from "@/components/registration-form";
import type { Field } from "@/lib/events";

export function RegisterPanel({
  slug,
  team,
  fields,
  inviteCode,
}: {
  slug: string;
  team: boolean;
  fields: Field[];
  inviteCode: string;
}) {
  if (!team) {
    return (
      <RegistrationForm
        kind="register"
        slug={slug}
        team={false}
        fields={fields}
        submitLabel="Confirm registration"
      />
    );
  }

  return (
    <Tabs defaultValue={inviteCode ? "join" : "create"} className="gap-6">
      <TabsList className="w-full">
        <TabsTrigger value="create">Create a team</TabsTrigger>
        <TabsTrigger value="join">Join a team</TabsTrigger>
      </TabsList>
      <TabsContent value="create">
        <RegistrationForm
          kind="register"
          slug={slug}
          team
          fields={fields}
          submitLabel="Create team"
        />
      </TabsContent>
      <TabsContent value="join">
        <RegistrationForm
          kind="join"
          inviteCode={inviteCode}
          fields={fields}
          submitLabel="Join team"
        />
      </TabsContent>
    </Tabs>
  );
}
