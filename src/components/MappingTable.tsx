
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
}

const MappingTable: React.FC<MappingTableProps> = ({ headers, show, onMappingSubmit }) => {
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [isComplete, setIsComplete] = useState(false);

  const mappingFields: FieldMapping[] = [
    { en: 'Survey No', te: 'సర్వే నెం' },
    { en: 'Khata No', te: 'ఖాతా సంఖ్య' },
    { en: 'Pattadar Name', te: 'భూ యజమాని పేరు' },
    { en: 'Relation Name', te: 'భర్త/తండ్రి పేరు' },
    { en: 'Mobile Number', te: 'మొబైల్ నెంబరు' }
  ];

  useEffect(() => {
    // Check if all required fields have been mapped
    const requiredFieldsMapped = mappingFields.every(field => mappings[field.en]);
    setIsComplete(requiredFieldsMapped);
  }, [mappings]);

  const handleMappingChange = (field: string, value: string) => {
    setMappings(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onMappingSubmit(mappings);
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
          className="mt-8 no-print"
        >
          <Card className="glass-panel">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-medium mb-6">Map CSV Columns</h2>
              <div className="overflow-x-auto">
                <Table className="border-collapse border border-gray-300">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="border border-gray-300 text-center font-bold">Field Name</TableHead>
                      <TableHead className="border border-gray-300 text-center font-bold">Telugu Field Name</TableHead>
                      <TableHead className="border border-gray-300 text-center font-bold">CSV Column</TableHead>
                      <TableHead className="w-16 border border-gray-300 text-center font-bold">Status</TableHead>
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
                        <TableCell className="font-medium border border-gray-300">{field.en}</TableCell>
                        <TableCell className="telugu-text border border-gray-300">{field.te}</TableCell>
                        <TableCell className="border border-gray-300">
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
                        <TableCell className="border border-gray-300 text-center">
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
              
              <div className="flex justify-end mt-6">
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
