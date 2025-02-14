
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Clock, Trash2, XCircle } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UploadLog {
  id: string;
  created_at: string;
  filename: string;
  success_count: number;
  error_count: number;
  errors: any;
  status: string;
  enrichment_start_time?: string;
  enrichment_end_time?: string;
}

interface ImportLogsProps {
  logs: UploadLog[];
  onDelete: (logId: string) => Promise<void>;
}

const ImportLogs = ({ logs, onDelete }: ImportLogsProps) => {
  const formatTimeframe = (start?: string, end?: string) => {
    if (!start) return "Not started";
    if (!end) return "In progress...";
    
    const duration = new Date(end).getTime() - new Date(start).getTime();
    return `${Math.round(duration / 1000)}s`;
  };

  const formatErrors = (errors: any) => {
    if (!errors) return null;
    
    // If errors is an array, format each error
    if (Array.isArray(errors)) {
      return errors.map((error, index) => (
        <div key={index} className="mb-4 last:mb-0">
          <h4 className="font-medium text-red-600 mb-1">
            Error {index + 1}
          </h4>
          <pre className="text-sm bg-gray-50 p-2 rounded">
            {typeof error === 'object' ? JSON.stringify(error, null, 2) : error}
          </pre>
        </div>
      ));
    }
    
    // If errors is an object, stringify it
    if (typeof errors === 'object') {
      return (
        <pre className="text-sm bg-gray-50 p-2 rounded">
          {JSON.stringify(errors, null, 2)}
        </pre>
      );
    }
    
    // If errors is a string, display it directly
    return <p className="text-sm text-red-600">{errors}</p>;
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Recent Imports</h2>
      <div className="space-y-4">
        {logs.map((log) => (
          <Card key={log.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{log.filename}</p>
                  <span className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {log.success_count}
                  </div>
                  {log.error_count > 0 && (
                    <div className="flex items-center text-red-600">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {log.error_count}
                    </div>
                  )}
                  {(log.enrichment_start_time || log.enrichment_end_time) && (
                    <div className="flex items-center text-blue-600">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatTimeframe(log.enrichment_start_time, log.enrichment_end_time)}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {log.errors && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        View Errors
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Import Errors</DialogTitle>
                        <DialogDescription>
                          Errors encountered while importing {log.filename}
                        </DialogDescription>
                      </DialogHeader>
                      <ScrollArea className="max-h-[60vh] mt-4">
                        {formatErrors(log.errors)}
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Import Log</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this import log? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(log.id)}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </Card>
        ))}
        {logs.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No import logs available
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportLogs;
