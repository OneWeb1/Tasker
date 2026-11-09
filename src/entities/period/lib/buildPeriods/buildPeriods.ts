import type { PeriodScale } from '../../model/constants/periodScales';
import type { Period } from '../../model/types/period';
import { PERIOD_BUILDERS } from './periodBuilders';
import type { PeriodBuildContext } from './periodBuilders';

export const buildPeriods = (scale: PeriodScale, context: PeriodBuildContext): Period[] =>
  PERIOD_BUILDERS[scale](context);