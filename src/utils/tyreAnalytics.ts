export type TyreStat = {
  brand: string;
  model: string;
  totalDistance: number;
  totalCost: number;
};

export type RankedTyre = TyreStat & {
  costPerKm: number;
  performanceRating: 'excellent' | 'good' | 'average' | 'poor';
  rank: number;
};

export function getBestTyres(data: TyreStat[]): RankedTyre[] {
  const tyresWithCostPerKm = data.map((tyre) => ({
    ...tyre,
    costPerKm: tyre.totalDistance > 0 ? tyre.totalCost / tyre.totalDistance : Infinity,
  }));

  const sortedTyres = tyresWithCostPerKm.sort((a, b) => a.costPerKm - b.costPerKm);

  return sortedTyres.map((tyre, index) => {
    let performanceRating: 'excellent' | 'good' | 'average' | 'poor';
    const totalTyres = sortedTyres.length;
    const percentile = (index + 1) / totalTyres;

    if (percentile <= 0.25) {
      performanceRating = 'excellent';
    } else if (percentile <= 0.5) {
      performanceRating = 'good';
    } else if (percentile <= 0.75) {
      performanceRating = 'average';
    } else {
      performanceRating = 'poor';
    }

    return {
      ...tyre,
      performanceRating,
      rank: index + 1,
    };
  });
}

export function getTyrePerformanceStats(data: TyreStat[]) {
  const validTyres = data.filter(tyre => tyre.totalDistance > 0);
  
  if (validTyres.length === 0) {
    return {
      averageCostPerKm: 0,
      bestPerformer: null,
      worstPerformer: null,
      totalTyres: data.length,
      validTyres: 0,
    };
  }

  const rankedTyres = getBestTyres(validTyres);
  const averageCostPerKm = validTyres.reduce((sum, tyre) => {
    return sum + (tyre.totalCost / tyre.totalDistance);
  }, 0) / validTyres.length;

  return {
    averageCostPerKm,
    bestPerformer: rankedTyres[0],
    worstPerformer: rankedTyres[rankedTyres.length - 1],
    totalTyres: data.length,
    validTyres: validTyres.length,
    rankedTyres,
  };
}

export function filterTyresByPerformance(
  data: TyreStat[], 
  performance: 'excellent' | 'good' | 'average' | 'poor'
): RankedTyre[] {
  const rankedTyres = getBestTyres(data);
  return rankedTyres.filter(tyre => tyre.performanceRating === performance);
}

export function getTyreBrandPerformance(data: TyreStat[]) {
  const brandStats = new Map<string, { 
    totalCost: number; 
    totalDistance: number; 
    count: number; 
  }>();

  data.forEach(tyre => {
    if (tyre.totalDistance > 0) {
      const existing = brandStats.get(tyre.brand) || { 
        totalCost: 0, 
        totalDistance: 0, 
        count: 0 
      };
      
      brandStats.set(tyre.brand, {
        totalCost: existing.totalCost + tyre.totalCost,
        totalDistance: existing.totalDistance + tyre.totalDistance,
        count: existing.count + 1,
      });
    }
  });

  return Array.from(brandStats.entries()).map(([brand, stats]) => ({
    brand,
    averageCostPerKm: stats.totalCost / stats.totalDistance,
    totalTyres: stats.count,
    totalDistance: stats.totalDistance,
    totalCost: stats.totalCost,
  })).sort((a, b) => a.averageCostPerKm - b.averageCostPerKm);
}
