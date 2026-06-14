import Vue from 'vue';

const alarmNotifier = new Vue();

alarmNotifier.NOTIFY_EVENT = 'alarm:notify';
alarmNotifier.MAX_VISIBLE = 5;
alarmNotifier.AUTO_DISMISS_MS = 8000;

export default alarmNotifier;
