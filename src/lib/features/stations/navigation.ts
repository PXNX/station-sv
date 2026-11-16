export type StationNavigationEvent = {
	defaultPrevented: boolean;
	button: number;
	metaKey: boolean;
	ctrlKey: boolean;
	shiftKey: boolean;
	altKey: boolean;
};

/** Leaves alternate, modified, and browser-managed link actions untouched. */
export function shouldAnimateStationNavigation(event: StationNavigationEvent): boolean {
	return !(
		event.defaultPrevented ||
		event.button !== 0 ||
		event.metaKey ||
		event.ctrlKey ||
		event.shiftKey ||
		event.altKey
	);
}
