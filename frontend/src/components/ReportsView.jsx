import React from 'react';
import useQueueStore from '../store/useQueueStore';
import AttendanceReport from './reports/AttendanceReport';
import GameHistoryReport from './reports/GameHistoryReport';

export default function ReportsView() {
  const currentView = useQueueStore(state => state.currentView);

  // This component acts as a router for the different report views.
  // The main App component would render this when the view is a report type.
  switch (currentView) {
    case 'ATTENDANCE_REPORT':
      return <AttendanceReport />;
    case 'GAME_HISTORY_REPORT':
      return <GameHistoryReport />;
    default:
      // Fallback or a default report selection screen
      return (
        <div className="p-8 text-center">
          <h2 className="text-lg font-bold">Reports</h2>
          <p className="text-slate-500">Please select a report to view.</p>
        </div>
      );
  }
}