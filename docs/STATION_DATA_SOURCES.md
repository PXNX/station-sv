# Station data sources

## OpenStation

OpenStation is DB InfraGO’s published source for passenger-station infrastructure. The DB API Marketplace describes it as the source of truth for infrastructure data and states that it aligns with European NeTEx and SIRI standards as well as accessibility requirements under TSI-PRM. Its data model may have gaps for individual stations, so imports must keep a source timestamp and never invent absent values.

For a productive connection, the OpenStation product page recommends the German national access point, Mobilithek, rather than relying on an ad-hoc marketplace integration. This makes OpenStation suitable for structured imports of infrastructure and accessibility data after its source terms have been recorded in the import metadata.

## Existing complementary sources

Bahn-Vorhersage’s public stations dataset remains appropriate for the existing stable identifiers, coordinates, DS100 short codes and transport modes. Railway-Stations.org remains appropriate for community photos and their per-image metadata; its station identifier must be used only to address the station page, not a photo object identifier.

## References

[1] [DB API Marketplace: OpenStation](https://developers.deutschebahn.com/db-api-marketplace/apis/product/open-station)

[2] [OpenStation NeTEx on Mobilithek](https://mobilithek.info/offers/879076212433727488)

[3] [Bahn-Vorhersage stations dataset](https://bahnvorhersage.de/api/stations.json)

[4] [Railway-Stations.org API](https://api.railway-stations.org/photoStationsByCountry/de)
