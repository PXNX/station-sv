CREATE TABLE "stations" (
	"station_id" integer PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"city" varchar(255),
	"country" varchar(2) NOT NULL,
	"has_warm_sleep" boolean DEFAULT false,
	"sleep_notes" text,
	"has_outlets" boolean DEFAULT false,
	"outlet_notes" text,
	"has_toilets" boolean DEFAULT false,
	"toilet_notes" text,
	"toilets_open_at_night" boolean DEFAULT false,
	"is_open_24h" boolean DEFAULT false,
	"opening_hours" varchar(100),
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"additional_info" text
);
