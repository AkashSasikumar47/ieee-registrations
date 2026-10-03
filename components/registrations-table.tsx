"use client";

import { useState } from "react";
import Link from "next/link";
import { Alert, AlertDescription } from "@ieee/ui/components/alert";
import { Button } from "@ieee/ui/components/button";
import { Input } from "@ieee/ui/components/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@ieee/ui/components/native-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ieee/ui/components/table";
import { AdminCancelButton } from "@/components/admin-cancel-button";
import { useCheckIn } from "@/components/use-check-in";
import type { AdminEntry } from "@/lib/admin-entries";
import type { Field } from "@/lib/events";
import { formatDayTime } from "@/lib/format";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "confirmed", label: "Confirmed" },
  { value: "waitlisted", label: "Waitlisted" },
  { value: "cancelled", label: "Cancelled" },
  { value: "checked-in", label: "Checked in" },
];

const ROLES = { solo: "Solo", leader: "Lead", member: "Member" };

export function RegistrationsTable({
  entries,
  fields,
  over,
}: {
  entries: AdminEntry[];
  fields: Field[];
  over: boolean;
}) {
  const { checkedInAt, toggle, pending, error } = useCheckIn();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const search = query.trim().toLowerCase();
  const shown = entries.filter((entry) => {
    if (filter === "checked-in" && !checkedInAt(entry)) return false;
    if (filter !== "all" && filter !== "checked-in" && entry.status !== filter)
      return false;
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 px-site-4 sm:flex-row md:px-site-5">
        <Input
          type="search"
          aria-label="Search registrations"
          placeholder="Search name, register number, email, team…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="sm:max-w-md"
        />
        <NativeSelect
          aria-label="Filter"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        >
          {FILTERS.map((item) => (
            <NativeSelectOption key={item.value} value={item.value}>
              {item.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <p className="font-mono text-xs text-muted-foreground uppercase sm:ml-auto sm:self-center">
          Showing {shown.length} of {entries.length}
        </p>
      </div>
      {error && (
        <Alert variant="destructive" className="mx-4 w-auto md:mx-5">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="border-y">
        <Table>
          <TableHeader>
            <TableRow className="font-mono text-xs uppercase">
              <TableHead className="pl-4 md:pl-5">#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Register no.</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Checked in</TableHead>
              <TableHead>Registered</TableHead>
              {fields.map((field) => (
                <TableHead key={field.key}>{field.label}</TableHead>
              ))}
              <TableHead className="pr-4 text-right md:pr-5">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shown.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10 + fields.length}
                  className="py-12 text-center font-mono text-xs text-muted-foreground uppercase"
                >
                  No registrations match.
                </TableCell>
              </TableRow>
            ) : (
              shown.map((entry) => {
                const arrived = checkedInAt(entry);
                return (
                  <TableRow key={entry.id}>
                    <TableCell className="pl-4 font-mono text-xs text-muted-foreground md:pl-5">
                      {entries.indexOf(entry) + 1}
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link
                        href={`/t/${entry.ticket_code}`}
                        className="underline-offset-4 hover:underline"
                      >
                        {entry.name}
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {entry.register_number}
                    </TableCell>
                    <TableCell>{entry.email}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {entry.phone}
                    </TableCell>
                    <TableCell>
                      {entry.team
                        ? `${entry.team} · ${ROLES[entry.role]}`
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-0.5 font-mono text-[0.65rem] font-semibold uppercase ${
                          entry.status === "confirmed"
                            ? "bg-foreground text-background"
                            : entry.status === "waitlisted"
                              ? "border"
                              : "text-muted-foreground line-through"
                        }`}
                      >
                        {entry.status}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {arrived ? formatDayTime(arrived) : "—"}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {formatDayTime(entry.created_at)}
                    </TableCell>
                    {fields.map((field) => (
                      <TableCell
                        key={field.key}
                        className="max-w-64 truncate"
                        title={entry.answers[field.key]}
                      >
                        {entry.answers[field.key] || "—"}
                      </TableCell>
                    ))}
                    <TableCell className="pr-4 md:pr-5">
                      <div className="flex justify-end gap-2">
                        {entry.status === "confirmed" && (
                          <Button
                            size="sm"
                            variant={arrived ? "outline" : "default"}
                            className="font-mono uppercase"
                            disabled={pending === entry.id}
                            onClick={() => toggle(entry)}
                          >
                            {arrived ? "Undo" : "Check in"}
                          </Button>
                        )}
                        {entry.status !== "cancelled" && !over && (
                          <AdminCancelButton
                            id={entry.id}
                            name={entry.name}
                            leader={entry.role === "leader"}
                          />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
