// crawler.ts
export {};

interface DBStationResponse {
	result: Array<{
		number: number;
		name: string;
		category: number; // 1-7, where 1 is most important
		priceCategory?: number;
		mailingAddress: {
			city: string;
			zipcode: string;
			street: string;
		};
		evaNumbers: Array<{
			number: number;
			isMain: boolean;
			geographicCoordinates: {
				type: string;
				coordinates: [number, number];
			};
		}>;
		ril100Identifiers?: Array<{
			rilIdentifier: string;
		}>;
		szentrale?: {
			number: string;
			publicPhoneNumber: string;
			name: string;
		};
		stationManagement?: {
			name: string;
			number: number;
		};
		federalState?: string;
		regionalbereich?: {
			name: string;
			shortName: string;
			number: number;
		};
		aufgabentraeger?: {
			shortName: string;
			name: string;
		};
		DBinformation?: {
			availability: {
				monday: { fromTime: string; toTime: string };
				tuesday: { fromTime: string; toTime: string };
				wednesday: { fromTime: string; toTime: string };
				thursday: { fromTime: string; toTime: string };
				friday: { fromTime: string; toTime: string };
				saturday: { fromTime: string; toTime: string };
				sunday: { fromTime: string; toTime: string };
				holiday: { fromTime: string; toTime: string };
			};
		};
		localServiceStaff?: {
			availability: {
				monday: { fromTime: string; toTime: string };
				tuesday: { fromTime: string; toTime: string };
				wednesday: { fromTime: string; toTime: string };
				thursday: { fromTime: string; toTime: string };
				friday: { fromTime: string; toTime: string };
				saturday: { fromTime: string; toTime: string };
				sunday: { fromTime: string; toTime: string };
				holiday: { fromTime: string; toTime: string };
			};
		};
		timeTableOffice?: {
			email: string;
			name: string;
		};
		hasWiFi?: boolean;
		hasTravelCenter?: boolean;
		hasRailwayMission?: boolean;
		hasDBLounge?: boolean;
		hasLostAndFound?: boolean;
		hasTravelNecessities?: boolean;
		hasSteplessAccess?: string;
		hasMobilityService?: string;
		hasPublicFacilities?: boolean;
		hasLockerSystem?: boolean;
		hasTaxiRank?: boolean;
		hasCarRental?: boolean;
		hasParking?: boolean;
		hasBicycleParking?: boolean;
	}>;
}

interface Station {
	eva: number;
	stationIdGER?: number;
	name: string;
	city: string;
	country: string;
	category: number; // 1-7, where 1 is most important
	priceCategory?: number;
	hasWarmSleep?: boolean;
	sleepNotes?: string;
	hasOutlets?: boolean;
	outletNotes?: string;
	hasToilets?: boolean;
	toiletNotes?: string;
	toiletsOpenAtNight?: boolean;
	isOpen24h?: boolean;
	openingHours?: string;
	hasWifi?: boolean;
	wifiHasLimit?: boolean;
	wifiNotes?: string;
	latitude: number;
	longitude: number;
	additionalInfo?: string;
}

class DBStationCrawler {
	private clientId: string;
	private apiKey: string;
	private baseUrl = 'https://apis.deutschebahn.com/db-api-marketplace/apis';

	constructor(clientId: string, apiKey: string) {
		this.clientId = clientId;
		this.apiKey = apiKey;
	}

	async fetchAllStations(): Promise<DBStationResponse> {
		console.log('Fetching stations from StaDa API...');

		const response = await fetch(`${this.baseUrl}/station-data/v2/stations`, {
			headers: {
				Accept: 'application/json',
				'DB-Client-ID': this.clientId,
				'DB-Api-Key': this.apiKey
			}
		});

		if (!response.ok) {
			const text = await response.text();
			throw new Error(`StaDa API error: ${response.status} ${response.statusText}\n${text}`);
		}

		return await response.json();
	}

	private formatOpeningHours(availability: any): string | undefined {
		if (!availability) return undefined;

		const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
		const hours = days
			.map((day) => {
				const dayData = availability[day];
				if (dayData && dayData.fromTime && dayData.toTime) {
					return `${day.substring(0, 3)}: ${dayData.fromTime}-${dayData.toTime}`;
				}
				return null;
			})
			.filter(Boolean);

		return hours.length > 0 ? hours.join(', ') : undefined;
	}

	private checkIf24h(availability: any): boolean {
		if (!availability) return false;

		const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
		return days.every((day) => {
			const dayData = availability[day];
			return dayData && dayData.fromTime === '00:00' && dayData.toTime === '24:00';
		});
	}

	private convertToStation(dbStation: DBStationResponse['result'][0]): Station | null {
		const mainEva = dbStation.evaNumbers.find((eva) => eva.isMain);
		if (!mainEva) {
			console.warn(`No main EVA for station ${dbStation.name}`);
			return null;
		}

		const [longitude, latitude] = mainEva.geographicCoordinates.coordinates;

		// Try to get station ID from number field
		const stationIdGER = dbStation.number;

		// Check for 24/7 operation
		const is24h =
			this.checkIf24h(dbStation.DBinformation?.availability) ||
			this.checkIf24h(dbStation.localServiceStaff?.availability);

		// Get opening hours from DB Information or local staff
		const openingHours =
			this.formatOpeningHours(dbStation.DBinformation?.availability) ||
			this.formatOpeningHours(dbStation.localServiceStaff?.availability);

		// Build additional info
		const additionalInfoParts = [];
		if (dbStation.hasTravelCenter) additionalInfoParts.push('Travel Center');
		if (dbStation.hasDBLounge) additionalInfoParts.push('DB Lounge');
		if (dbStation.hasRailwayMission) additionalInfoParts.push('Railway Mission');
		if (dbStation.hasLostAndFound) additionalInfoParts.push('Lost & Found');
		if (dbStation.hasTravelNecessities) additionalInfoParts.push('Travel Shop');
		if (dbStation.hasLockerSystem) additionalInfoParts.push('Lockers');
		if (dbStation.hasTaxiRank) additionalInfoParts.push('Taxi');
		if (dbStation.hasCarRental) additionalInfoParts.push('Car Rental');
		if (dbStation.hasParking) additionalInfoParts.push('Parking');
		if (dbStation.hasBicycleParking) additionalInfoParts.push('Bike Parking');
		if (dbStation.hasSteplessAccess)
			additionalInfoParts.push(`Stepless Access: ${dbStation.hasSteplessAccess}`);
		if (dbStation.hasMobilityService)
			additionalInfoParts.push(`Mobility Service: ${dbStation.hasMobilityService}`);

		return {
			eva: mainEva.number,
			stationIdGER: stationIdGER,
			name: dbStation.name,
			city: dbStation.mailingAddress.city,
			country: 'DE',
			category: dbStation.category,
			priceCategory: dbStation.priceCategory,

			hasWifi: dbStation.hasWiFi ?? false,
			wifiHasLimit: undefined,
			wifiNotes: dbStation.hasWiFi ? 'Free DB WiFi (WIFIonICE)' : undefined,

			hasToilets: dbStation.hasPublicFacilities ?? undefined,
			toiletNotes: dbStation.hasPublicFacilities ? 'Public facilities available' : undefined,
			toiletsOpenAtNight: is24h ? true : undefined,

			hasOutlets: undefined,
			outletNotes: undefined,

			hasWarmSleep: undefined,
			sleepNotes: undefined,

			isOpen24h: is24h || undefined,
			openingHours: openingHours,

			latitude,
			longitude,

			additionalInfo: additionalInfoParts.length > 0 ? additionalInfoParts.join('; ') : undefined
		};
	}

	async crawlAndSave(): Promise<void> {
		console.log('🚂 Starting Deutsche Bahn station crawler...\n');

		try {
			const stationsData = await this.fetchAllStations();
			console.log(`✅ Fetched ${stationsData.result.length} stations\n`);

			const stations: Station[] = [];
			for (const dbStation of stationsData.result) {
				const station = this.convertToStation(dbStation);
				if (station) {
					stations.push(station);
				}
			}

			console.log(`✅ Converted ${stations.length} stations\n`);

			// Save to JSON files
			const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
			const outputFile = `stations-${timestamp}.json`;
			const outputFilePretty = `stations-latest.json`;

			await Bun.write(outputFile, JSON.stringify(stations));
			await Bun.write(outputFilePretty, JSON.stringify(stations, null, 2));

			console.log(`💾 Saved to:`);
			console.log(`   - ${outputFile} (compact)`);
			console.log(`   - ${outputFilePretty} (formatted)\n`);

			// Print some stats
			const withWifi = stations.filter((s) => s.hasWifi).length;
			const with24h = stations.filter((s) => s.isOpen24h).length;
			const withToilets = stations.filter((s) => s.hasToilets).length;
			const category1 = stations.filter((s) => s.category === 1).length;
			const category2 = stations.filter((s) => s.category === 2).length;

			console.log('📊 Statistics:');
			console.log(`   - Total stations: ${stations.length}`);
			console.log(`   - Category 1 (major hubs): ${category1}`);
			console.log(`   - Category 2 (important): ${category2}`);
			console.log(
				`   - With WiFi: ${withWifi} (${Math.round((withWifi / stations.length) * 100)}%)`
			);
			console.log(`   - Open 24h: ${with24h} (${Math.round((with24h / stations.length) * 100)}%)`);
			console.log(
				`   - With toilets: ${withToilets} (${Math.round((withToilets / stations.length) * 100)}%)`
			);
		} catch (error) {
			console.error('❌ Error:', error);
			throw error;
		}
	}
}

// Run the crawler
const CLIENT_ID = process.env.DB_CLIENT_ID;
const API_SECRET = process.env.DB_API_KEY;

if (!CLIENT_ID || !API_SECRET) {
	console.error('❌ Error: DB_CLIENT_ID and DB_API_KEY must be set in .env file');
	process.exit(1);
}

const crawler = new DBStationCrawler(CLIENT_ID, API_SECRET);
await crawler.crawlAndSave();
