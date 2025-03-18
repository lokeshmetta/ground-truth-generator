import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

interface FieldMapping {
  en: string;
  te: string;
}

interface MappingTableProps {
  headers: string[];
  show: boolean;
  onMappingSubmit: (mapping: Record<string, string>) => void;
  onPreview: (mapping: Record<string, string>) => void;
}

const MappingTable: React.FC<MappingTableProps> = ({ headers, show, onMappingSubmit, onPreview }) => {
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [isComplete, setIsComplete] = useState(false);

  const requiredFields: FieldMapping[] = [
    { en: 'Survey No', te: 'సర్వే నెం' },
    { en: 'Khata No', te: 'ఖాతా సంఖ్య' },
    { en: 'Pattadar Name', te: 'భూ యజమాని పేరు' },
    { en: 'Relation Name', te: 'భర్త/తండ్రి పేరు' },
  ];

  const optionalFields: FieldMapping[] = [
    { en: 'Mobile Number', te: 'మొబైల్ నెంబరు' }
  ];

  const mappingFields = [...requiredFields, ...optionalFields];

  useEffect(() => {
    // Check if all required fields (excluding optional ones) have been mapped
    const requiredFieldsMapped = requiredFields.every(field => mappings[field.en]);
    setIsComplete(requiredFieldsMapped);
  }, [mappings]);

  const handleMappingChange = (field: string, value: string) => {
    setMappings(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onMappingSubmit(mappings);
  };

  const handlePreview = () => {
    onPreview(mappings);
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="mt-8 print:!bg-transparent no-print"
        >
          <Card className="glass-panel print:!bg-transparent print:!shadow-none">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-medium mb-6">Map CSV Columns</h2>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-left font-bold">Field Name</TableHead>
                      <TableHead className="text-left font-bold telugu-text">Telugu Field Name</TableHead>
                      <TableHead className="text-left font-bold">CSV Column</TableHead>
                      <TableHead className="w-16 text-center font-bold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mappingFields.map((field, index) => (
                      <motion.tr
                        key={field.en}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <TableCell className="font-medium">{field.en}</TableCell>
                        <TableCell className="telugu-text">{field.te}</TableCell>
                        <TableCell>
                          <Select
                            value={mappings[field.en] || ''}
                            onValueChange={(value) => handleMappingChange(field.en, value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select column" />
                            </SelectTrigger>
                            <SelectContent>
                              {headers.map((header) => (
                                <SelectItem key={header} value={header}>
                                  {header}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-center">
                          {mappings[field.en] ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <div className="h-5 w-5 rounded-full border border-gray-300 mx-auto" />
                          )}
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex justify-end mt-6 space-x-4">
                {/* Preview button removed */}
                <Button 
                  onClick={handleSubmit} 
                  disabled={!isComplete}
                  className="transition-all duration-300"
                >
                  Generate Notices
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MappingTable;
