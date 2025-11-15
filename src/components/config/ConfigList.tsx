import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { OcrConfig } from "@/types/config";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ConfigListProps {
  configs: OcrConfig[];
  onEdit: (config: OcrConfig) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}

export const ConfigList = ({ configs, onEdit, onDelete, onNew }: ConfigListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredConfigs = configs.filter(
    (config) =>
      config.documentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.companyId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.transporterCompanyId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Card className="flex flex-col h-full">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">OCR Configurations</h2>
            <Button onClick={onNew} className="gap-2">
              <Plus className="h-4 w-4" />
              New Configuration
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by document type, company, or transporter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-table-header-bg hover:bg-table-header-bg">
                <TableHead>Document Type</TableHead>
                <TableHead>Company ID</TableHead>
                <TableHead>Transporter ID</TableHead>
                <TableHead>Fields</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredConfigs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? "No configurations found" : "No configurations yet. Create your first one!"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredConfigs.map((config) => (
                  <TableRow key={config.id} className="hover:bg-hover-bg">
                    <TableCell className="font-medium">{config.documentType}</TableCell>
                    <TableCell>{config.companyId}</TableCell>
                    <TableCell>
                      {config.transporterCompanyId || (
                        <span className="text-muted-foreground">All</span>
                      )}
                    </TableCell>
                    <TableCell>{config.fields.length}</TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(config.updatedAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(config)}
                          className="gap-1"
                        >
                          <Pencil className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteId(config.id)}
                          className="gap-1 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Configuration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this configuration? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  onDelete(deleteId);
                  setDeleteId(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
