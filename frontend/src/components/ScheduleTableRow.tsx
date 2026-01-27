import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import DrawerScheduleDelete from "@/components/DrawerScheduleDelete";
import DrawerScheduleEdit from "@/components/DrawerScheduleEdit";

export type ScheduleRow = {
  id?: string;
  gmnId?: string;
  medicine: string;
  count: number;
  days: string[];
  times: string[];
  description: string;
};

type ScheduleTableRowProps = {
  schedule: ScheduleRow;
  intervalLabel: string;
  onEdit?: (schedule: ScheduleRow) => Promise<boolean> | boolean | void;
  onDelete?: () => Promise<boolean> | boolean | void;
  onStatusChange?: (status: "optijd" | "gemist") => Promise<boolean> | boolean | void;
};

export default function ScheduleTableRow({
  schedule,
  intervalLabel,
  onEdit,
  onDelete,
  onStatusChange,
}: ScheduleTableRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium">{schedule.medicine}</TableCell>
      <TableCell>{`${schedule.count}x`}</TableCell>
      <TableCell>{schedule.description}</TableCell>
      <TableCell>{intervalLabel}</TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            size="sm"
            className="h-8 bg-green-500/15 text-green-200 hover:bg-green-500/25"
            onClick={() => onStatusChange?.("optijd")}
          >
            Op tijd
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-8 bg-red-500/15 text-red-200 hover:bg-red-500/25"
            onClick={() => onStatusChange?.("gemist")}
          >
            Gemist
          </Button>
          <DrawerScheduleEdit schedule={schedule} onSave={onEdit} />
          <DrawerScheduleDelete scheduleLabel={schedule.medicine} onConfirm={onDelete} />
        </div>
      </TableCell>
    </TableRow>
  );
}
