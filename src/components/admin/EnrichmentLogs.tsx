
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface EnrichmentLog {
  id: string;
  created_at: string;
  status: string;
  businesses_found: number;
  businesses_processed: number;
  errors?: any;
  start_time?: string;
  end_time?: string;
}

interface EnrichmentLogsProps {
  logs: EnrichmentLog[];
  onDeleteLog: (logId: string) => Promise<void>;
}

const EnrichmentLogs = ({ logs, onDeleteLog }: EnrichmentLogsProps) => {
  const formatDuration = (start?: string, end?: string) => {
    if (!start) return "Not started";
    if (!end) return "In progress...";
    
    const duration = new Date(end).getTime() - new Date(start).getTime();
    return `${Math.round(duration / 1000)}s`;
  };

  return (
    <div className="space-y-4">
      {logs.map((log) => (
        <Card key={log.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Badge variant={log.status === 'completed' ? 'success' : 'secondary'}>
                  {log.status}
                </Badge>
                <span className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-sm text-gray-600">
                  Found: {log.businesses_found}
                </span>
                <span className="text-sm text-gray-600">
                  Processed: {log.businesses_processed}
                </span>
                <span className="text-sm text-gray-600">
                  Duration: {formatDuration(log.start_time, log.end_time)}
                </span>
              </div>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Enrichment Log</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this enrichment log? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDeleteLog(log.id)}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </Card>
      ))}
      {logs.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No enrichment runs recorded yet
        </div>
      )}
    </div>
  );
};

export default EnrichmentLogs;
