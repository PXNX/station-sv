CREATE TABLE IF NOT EXISTS "station_operations" (
  "station_eva" integer PRIMARY KEY NOT NULL REFERENCES "stations"("eva") ON DELETE CASCADE,
  "ds100" varchar(16),
  "is_active_ris" boolean,
  "is_active_iris" boolean,
  "meta_evas" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "available_transports" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "source_name" varchar(80) NOT NULL,
  "source_url" text NOT NULL,
  "imported_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "station_operations_ds100_idx" ON "station_operations" USING btree ("ds100");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "station_operations_active_ris_idx" ON "station_operations" USING btree ("is_active_ris");
