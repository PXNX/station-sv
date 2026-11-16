// src/lib/client/categories.ts
// One place for how important a station is: label, badge colour, card wash and
// the slim accent rail used on result rows.
export function getCategoryStyles(category: number) {
	switch (category) {
		case 1:
			return {
				label: 'Major hub',
				accent: 'bg-purple-400',
				badgeClass:
					'border-purple-400/50 bg-gradient-to-br from-purple-500/30 to-pink-500/30 text-purple-100',
				cardClass:
					'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400/50 hover:from-purple-500/30 hover:to-pink-500/30 hover:border-purple-400/70'
			};
		case 2:
			return {
				label: 'Important',
				accent: 'bg-blue-400',
				badgeClass:
					'border-blue-400/50 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 text-blue-100',
				cardClass:
					'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-400/50 hover:from-blue-500/30 hover:to-cyan-500/30 hover:border-blue-400/70'
			};
		case 3:
			return {
				label: 'Regional hub',
				accent: 'bg-emerald-400',
				badgeClass:
					'border-green-400/50 bg-gradient-to-br from-green-500/30 to-teal-500/30 text-green-100',
				cardClass:
					'bg-gradient-to-br from-green-500/20 to-teal-500/20 border-green-400/50 hover:from-green-500/30 hover:to-teal-500/30 hover:border-green-400/70'
			};
		case 4:
			return {
				label: 'Medium',
				accent: 'bg-amber-400',
				badgeClass:
					'border-orange-400/50 bg-gradient-to-br from-orange-500/30 to-amber-500/30 text-orange-100',
				cardClass:
					'bg-gradient-to-br from-orange-500/20 to-amber-500/20 border-orange-400/50 hover:from-orange-500/30 hover:to-amber-500/30 hover:border-orange-400/70'
			};
		default:
			return {
				label: 'Local station',
				accent: 'bg-slate-500',
				badgeClass:
					'border-gray-400/50 bg-gradient-to-br from-gray-500/30 to-slate-500/30 text-gray-100',
				cardClass:
					'bg-gradient-to-br from-gray-500/20 to-slate-500/20 border-gray-400/50 hover:from-gray-500/30 hover:to-slate-500/30 hover:border-gray-400/70'
			};
	}
}
