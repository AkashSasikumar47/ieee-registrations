"use client";

import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Download, ExternalLink, X } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@ieee/ui/components/alert-dialog";
import { Badge } from "@ieee/ui/components/badge";
import { Button } from "@ieee/ui/components/button";
import { Checkbox } from "@ieee/ui/components/checkbox";
import { Input } from "@ieee/ui/components/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@ieee/ui/components/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ieee/ui/components/table";
import { AdminCancelButton } from "@/components/admin-cancel-button";
import { AdminPromoteButton } from "@/components/admin-promote-button";
import { Choice } from "@/components/choice";
import { useCheckIn } from "@/components/use-check-in";
import type { AdminEntry } from "@/lib/admin-entries";
import type { Field } from "@/lib/events";
import { formatDayTime } from "@/lib/format";
import { send } from "@/lib/send";

const FILTERS = [
  { value: "all", label: "Everyone" },
  { value: "confirmed", label: "Confirmed" },
  { value: "waitlisted", label: "Waitlisted" },
  { value: "cancelled", label: "Cancelled" },
  { value: "checked-in", label: "Checked in" },
  { value: "not-in", label: "Not checked in" },
];

const ROLES = { solo: "Solo", leader: "Lead", member: "Member" };

export function RegistrationsTable({
  eventId,
  team,
  capacity,
  entries,
  fields,
}: {
  eventId: string;
  team: boolean;
  capacity: number | null;
  entries: AdminEntry[];
  fields: Field[];
}) {
  const router = useRouter();
  const { checkedInAt, toggle, pending } = useCheckIn();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openId, setOpenId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const search = query.trim().toLowerCase();
  const filtered = entries.filter((entry) => {
    const arrived = checkedInAt(entry);
    if (filter === "checked-in" && !arrived) return false;
    if (filter === "not-in" && (arrived || entry.status !== "confirmed")) {
      return false;
    }
    if (
      ["confirmed", "waitlisted", "cancelled"].includes(filter) &&
      entry.status !== filter
    ) {
      return false;
    }
    if (!search) return true;
    return [
      entry.name,
      entry.email,
      entry.register_number,
      entry.phone,
      entry.team ?? "",
      entry.ticket_code,
    ].some((value) => value.toLowerCase().includes(search));
  });
  const shown =
    view === "teams"
      ? [...filtered].sort(
          (a, b) =>
            (a.team ?? "~").localeCompare(b.team ?? "~") ||
            (a.role === "leader" ? -1 : b.role === "leader" ? 1 : 0),
        )
      : filtered;

  const open = entries.find((entry) => entry.id === openId) ?? null;
  const picked = entries.filter((entry) => selected.has(entry.id));
  const allShown =
    shown.length > 0 && shown.every((entry) => selected.has(entry.id));

  const count = (status: string) =>
    entries.filter((entry) => entry.status === status).length;
  const confirmed = count("confirmed");
  const stats = [
    {
      label: "Confirmed",
      value: capacity ? `${confirmed} / ${capacity}` : `${confirmed}`,
    },
    { label: "Waitlisted", value: `${count("waitlisted")}` },
    {
      label: "Checked in",
      value: `${entries.filter((entry) => entry.status === "confirmed" && checkedInAt(entry)).length}`,
    },
    { label: "Cancelled", value: `${count("cancelled")}` },
  ];

  function pick(id: string, on: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function pickAll(on: boolean) {
    setSelected(on ? new Set(shown.map((entry) => entry.id)) : new Set());
  }

  async function checkInPicked() {
    setBusy(true);
    let done = 0;
    for (const entry of picked) {
      if (entry.status !== "confirmed" || checkedInAt(entry)) continue;
      if (await toggle(entry)) done += 1;
    }
    setBusy(false);
    setSelected(new Set());
    toast.success(
      done
        ? `Checked in ${done} ${done === 1 ? "person" : "people"}.`
        : "Nobody to check in. Only confirmed people who aren't in yet can be.",
    );
  }

  async function cancelPicked() {
    setBusy(true);
    let done = 0;
    const order = [...picked].sort(
      (a, b) => Number(b.role === "leader") - Number(a.role === "leader"),
    );
    for (const entry of order) {
      if (entry.status === "cancelled") continue;
      const { error } = await send(
        `/api/admin/entries/${entry.id}/cancel`,
        { method: "POST" },
        "Couldn't cancel.",
      );
      if (!error) done += 1;
    }
    setBusy(false);
    setSelected(new Set());
    toast.success(
      `Cancelled ${done} ${done === 1 ? "registration" : "registrations"}.`,
    );
    router.refresh();
  }

  async function copyTicket(code: string) {
    await navigator.clipboard.writeText(`${window.location.origin}/t/${code}`);
    toast.success("Ticket link copied.");
  }

  async function toggleOne(entry: AdminEntry) {
    const was = checkedInAt(entry);
    if (await toggle(entry)) {
      toast.success(
        was ? `Undid ${entry.name}'s check-in.` : `Checked in ${entry.name}.`,
      );
    } else {
      toast.error("Couldn't update the check-in.");
    }
  }

  return (
    <div className="flex flex-col">
      <dl className="grid grid-cols-2 gap-3 px-gutter py-5 md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col gap-1 border p-4">
            <dt className="font-mono text-xs text-muted-foreground uppercase">
              {stat.label}
            </dt>
            <dd className="font-display text-3xl font-black tracking-[-0.04em] tabular-nums">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-col gap-3 border-y px-gutter py-3 lg:flex-row lg:items-center">
        <Input
          type="search"
          aria-label="Search registrations"
          placeholder="Search name, register number, email, team, ticket"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="lg:max-w-sm"
        />
        <div className="flex flex-wrap gap-2">
          <Choice
            label="Show"
            value={filter}
            onChange={setFilter}
            options={FILTERS}
            className="w-44"
          />
          {team && (
            <Choice
              label="View"
              value={view}
              onChange={setView}
              options={[
                { value: "list", label: "List" },
                { value: "teams", label: "By team" },
              ]}
              className="w-32"
            />
          )}
        </div>
        <div className="flex items-center gap-3 lg:ml-auto">
          <p className="font-mono text-xs text-muted-foreground uppercase">
            {shown.length} of {entries.length}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="font-mono uppercase"
            asChild
          >
            <a href={`/api/admin/events/${eventId}/csv`} download>
              <Download /> CSV
            </a>
          </Button>
        </div>
      </div>

      {picked.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-b bg-muted px-gutter py-2.5">
          <span className="mr-2 font-mono text-xs font-semibold uppercase">
            {picked.length} selected
          </span>
          <Button
            size="sm"
            className="font-mono uppercase"
            disabled={busy}
            onClick={checkInPicked}
          >
            <Check /> Check in
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="font-mono uppercase"
            asChild
          >
            <a
              href={`/api/admin/events/${eventId}/csv?ids=${picked.map((entry) => entry.id).join(",")}`}
              download
            >
              <Download /> Export
            </a>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="font-mono text-destructive uppercase"
                disabled={busy}
              >
                Cancel registrations
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Cancel {picked.length}{" "}
                  {picked.length === 1 ? "registration" : "registrations"}?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Team leads take their whole team with them. Freed seats go to
                  the waitlist. This can&apos;t be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep them</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={cancelPicked}>
                  Cancel registrations
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button
            size="sm"
            variant="ghost"
            className="ml-auto font-mono uppercase"
            onClick={() => setSelected(new Set())}
          >
            <X /> Clear
          </Button>
        </div>
      )}

      <div className="px-gutter">
        <Table>
          <TableHeader>
            <TableRow className="font-mono text-xs uppercase">
              <TableHead className="w-10 pl-0">
                <Checkbox
                  aria-label="Select all shown"
                  checked={allShown}
                  onCheckedChange={(checked) => pickAll(checked === true)}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">
                Register no.
              </TableHead>
              {team && (
                <TableHead className="hidden md:table-cell">Team</TableHead>
              )}
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Checked in</TableHead>
              <TableHead className="pr-4 text-right md:pr-8">
                Check-in
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shown.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-12 text-center font-mono text-xs text-muted-foreground uppercase"
                >
                  {entries.length === 0
                    ? "No registrations yet."
                    : "No registrations match."}
                </TableCell>
              </TableRow>
            ) : (
              shown.map((entry, index) => {
                const arrived = checkedInAt(entry);
                const newTeam =
                  view === "teams" && entry.team !== shown[index - 1]?.team;
                return (
                  <Fragment key={entry.id}>
                    {newTeam && (
                      <TableRow className="bg-muted hover:bg-muted">
                        <TableCell
                          colSpan={7}
                          className="px-0 py-2 font-mono text-xs font-semibold uppercase"
                        >
                          {entry.team ?? "No team"}
                          {entry.short && " · Team short"}
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow
                      data-state={
                        selected.has(entry.id) ? "selected" : undefined
                      }
                      className="cursor-pointer"
                      onClick={() => setOpenId(entry.id)}
                    >
                      <TableCell
                        className="pl-0"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <Checkbox
                          aria-label={`Select ${entry.name}`}
                          checked={selected.has(entry.id)}
                          onCheckedChange={(checked) =>
                            pick(entry.id, checked === true)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <span className="flex flex-col">
                          <span className="font-medium">{entry.name}</span>
                          <span className="font-mono text-xs text-muted-foreground md:hidden">
                            {entry.register_number}
                          </span>
                        </span>
                      </TableCell>
                      <TableCell className="hidden font-mono text-xs md:table-cell">
                        {entry.register_number}
                      </TableCell>
                      {team && (
                        <TableCell className="hidden md:table-cell">
                          {entry.team ? (
                            <span className="flex items-center gap-2">
                              {entry.team}
                              <span className="font-mono text-xs text-muted-foreground uppercase">
                                {ROLES[entry.role]}
                              </span>
                              {entry.short && (
                                <Badge
                                  variant="outline"
                                  className="font-mono uppercase"
                                >
                                  Short
                                </Badge>
                              )}
                            </span>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                      )}
                      <TableCell>
                        <Badge
                          variant={
                            entry.status === "confirmed" ? "default" : "outline"
                          }
                          className={`font-mono uppercase ${entry.status === "cancelled" ? "text-muted-foreground line-through" : ""}`}
                        >
                          {entry.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden font-mono text-xs sm:table-cell">
                        {arrived ? formatDayTime(arrived) : "—"}
                      </TableCell>
                      <TableCell
                        className="pr-4 text-right md:pr-8"
                        onClick={(event) => event.stopPropagation()}
                      >
                        {entry.status === "confirmed" && (
                          <Button
                            size="sm"
                            variant={arrived ? "outline" : "default"}
                            className="font-mono uppercase"
                            disabled={pending === entry.id}
                            onClick={() => toggleOne(entry)}
                          >
                            {arrived ? "Undo" : "Check in"}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  </Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet
        open={open !== null}
        onOpenChange={(next) => {
          if (!next) setOpenId(null);
        }}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {open && (
            <>
              <SheetHeader>
                <SheetTitle className="font-display text-2xl font-black uppercase">
                  {open.name}
                </SheetTitle>
                <SheetDescription className="font-mono text-xs uppercase">
                  {open.status}
                  {checkedInAt(open)
                    ? ` · In at ${formatDayTime(checkedInAt(open) as string)}`
                    : ""}
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-6 px-4 pb-6">
                <div className="flex flex-wrap gap-2">
                  {open.status === "confirmed" && (
                    <Button
                      className="font-mono uppercase"
                      variant={checkedInAt(open) ? "outline" : "default"}
                      disabled={pending === open.id}
                      onClick={() => toggleOne(open)}
                    >
                      {checkedInAt(open) ? "Undo check-in" : "Check in"}
                    </Button>
                  )}
                  {open.status === "waitlisted" && open.role !== "member" && (
                    <AdminPromoteButton id={open.id} />
                  )}
                  <Button
                    variant="outline"
                    className="font-mono uppercase"
                    onClick={() => copyTicket(open.ticket_code)}
                  >
                    <Copy /> Ticket link
                  </Button>
                  <Button
                    variant="outline"
                    className="font-mono uppercase"
                    asChild
                  >
                    <a href={`/t/${open.ticket_code}`} target="_blank">
                      <ExternalLink /> Ticket
                    </a>
                  </Button>
                </div>
                <dl className="flex flex-col border-t">
                  {[
                    ["Register number", open.register_number],
                    ["Email", open.email],
                    ["Mobile", open.phone],
                    ...(open.team
                      ? [
                          [
                            "Team",
                            `${open.team} · ${ROLES[open.role]}${open.short ? " · team short" : ""}`,
                          ],
                        ]
                      : []),
                    ["Registered", formatDayTime(open.created_at)],
                    ...fields.map((field) => [
                      field.label,
                      open.answers[field.key] || "—",
                    ]),
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex flex-col gap-0.5 border-b py-3"
                    >
                      <dt className="font-mono text-xs text-muted-foreground uppercase">
                        {label}
                      </dt>
                      <dd className="text-sm wrap-break-word">{value}</dd>
                    </div>
                  ))}
                </dl>
                {open.status !== "cancelled" && (
                  <div className="self-start">
                    <AdminCancelButton
                      id={open.id}
                      name={open.name}
                      leader={open.role === "leader"}
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
