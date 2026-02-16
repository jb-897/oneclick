"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createSessionSchema,
  type CreateSessionInput,
} from "@/lib/validations/session";

type SessionFormProps = {
  defaultValues?: Partial<CreateSessionInput> & { id?: string };
  sessionId?: string;
};

export function SessionForm({ defaultValues, sessionId }: SessionFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CreateSessionInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createSessionSchema) as any,
    defaultValues: defaultValues ?? {
      date: "",
      startTime: "14:00",
      durationMinutes: 90,
      place: "",
      totalSpots: 20,
      utilities: "laptop, charger",
      description: "",
      level: "beginner",
      tags: "",
      registrationOpen: true,
    },
  });

  const isEdit = !!sessionId;
  const onSubmit = async (values: CreateSessionInput) => {
    setError(null);
    const url = isEdit ? `/api/admin/sessions/${sessionId}` : "/api/admin/sessions";
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    router.push(isEdit ? `/admin/sessions/${sessionId}` : "/admin/sessions");
    router.refresh();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-xl">
        {error && (
          <p className="text-sm text-destructive font-medium" role="alert">
            {error}
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" className="font-mono" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start time</FormLabel>
                <FormControl>
                  <Input placeholder="14:00" className="font-mono" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="durationMinutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (minutes)</FormLabel>
                <FormControl>
                  <Input type="number" className="font-mono" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="totalSpots"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total spots</FormLabel>
                <FormControl>
                  <Input type="number" className="font-mono" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="place"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Place</FormLabel>
              <FormControl>
                <Input placeholder="Room 101" className="font-mono" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="utilities"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Required utilities (comma-separated)</FormLabel>
              <FormControl>
                <Input placeholder="laptop, charger" className="font-mono" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Input placeholder="Brief description" className="font-mono" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Level (optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g. beginner" className="font-mono" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags (comma-separated, optional)</FormLabel>
              <FormControl>
                <Input placeholder="python, web" className="font-mono" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {isEdit && (
          <FormField
            control={form.control}
            name="registrationOpen"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="rounded border-border"
                  />
                </FormControl>
                <FormLabel className="!mt-0">Registration open</FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <div className="flex gap-2">
          <Button type="submit" className="font-mono" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving…" : isEdit ? "Save" : "Create"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()} className="font-mono">
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
