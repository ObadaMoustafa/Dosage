import { TableCell, TableRow } from "@/components/ui/table";
import DrawerScheduleDelete from "@/components/DrawerScheduleDelete";
import DrawerScheduleEdit from "@/components/DrawerScheduleEdit";

export type ScheduleRow = {
  medicine: string;
  count: string;
  days: string[];
  times: string[];
  description: string;
};

type ScheduleTableRowProps = {
  schedule: ScheduleRow;
  intervalLabel: string;
};

export default function ScheduleTableRow({
  schedule,
  intervalLabel,
}: ScheduleTableRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium">{schedule.medicine}</TableCell>
      <TableCell>{schedule.count}</TableCell>
      <TableCell>{schedule.description}</TableCell>
      <TableCell>{intervalLabel}</TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <DrawerScheduleEdit schedule={schedule} />
          <DrawerScheduleDelete scheduleLabel={schedule.medicine} />
        </div>
      </TableCell>
    </TableRow>
  );
}
