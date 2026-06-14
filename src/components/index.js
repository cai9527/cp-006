import PageHeader from './layout/PageHeader.vue';
import StatsCard from './layout/StatsCard.vue';
import ChartCard from './layout/ChartCard.vue';
import FilterCard from './layout/FilterCard.vue';

import StatusBadge from './data/StatusBadge.vue';
import BaseChart from './data/BaseChart.vue';
import DataPagination from './data/DataPagination.vue';

import FormCard from './form/FormCard.vue';
import FormActions from './form/FormActions.vue';

import LiftCard from './business/LiftCard.vue';
import LiftDetailDialog from './business/LiftDetailDialog.vue';
import AlarmSummary from './business/AlarmSummary.vue';

const components = {
  PageHeader,
  StatsCard,
  ChartCard,
  FilterCard,
  StatusBadge,
  BaseChart,
  DataPagination,
  FormCard,
  FormActions,
  LiftCard,
  LiftDetailDialog,
  AlarmSummary
};

function install(Vue) {
  Object.keys(components).forEach(key => {
    Vue.component(key, components[key]);
  });
}

export {
  PageHeader,
  StatsCard,
  ChartCard,
  FilterCard,
  StatusBadge,
  BaseChart,
  DataPagination,
  FormCard,
  FormActions,
  LiftCard,
  LiftDetailDialog,
  AlarmSummary
};

export default { install };
