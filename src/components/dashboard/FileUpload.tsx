
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { parseCSV, parseXLSX, preprocessData } from '@/utils/data-parser';
import { ForestData } from '@/types/forest-data';
import { Upload, FileText, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface FileUploadProps {
  onDataLoaded: (data: ForestData[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploadStatus('uploading');
    setProgress(20);
    setError(null);

    try {
      let data: ForestData[] = [];
      
      // Parse file based on its type
      if (file.name.endsWith('.csv')) {
        setProgress(40);
        data = await parseCSV(file);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setProgress(40);
        data = await parseXLSX(file);
      } else {
        throw new Error('Unsupported file format. Please upload a CSV or Excel file.');
      }

      setProgress(70);
      
      // Basic validation
      if (!data || data.length === 0) {
        throw new Error('No data found in the file or invalid format.');
      }

      // Preprocess the data
      const processedData = preprocessData(data);
      setProgress(100);
      
      // Pass the processed data to the parent component
      onDataLoaded(processedData);
      setUploadStatus('success');
    } catch (error) {
      setUploadStatus('error');
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }, [onDataLoaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
  });

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-primary bg-primary/10' : 'border-border'}
            ${uploadStatus === 'error' ? 'border-destructive bg-destructive/10' : ''}
            ${uploadStatus === 'success' ? 'border-reforest bg-reforest/10' : ''}
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center gap-4">
            {uploadStatus === 'idle' && (
              <>
                <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
                  <Upload size={24} className="text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium text-lg">Upload Forest Data</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    Drag & drop a CSV or Excel file, or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Files should contain state, year, deforestation, and reforestation columns
                  </p>
                </div>
                <Button type="button" variant="outline" className="mt-2">
                  Select File
                </Button>
              </>
            )}
            
            {uploadStatus === 'uploading' && (
              <>
                <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
                  {progress < 50 ? <FileText size={24} className="text-primary animate-pulse" /> : 
                   <FileSpreadsheet size={24} className="text-primary animate-pulse" />}
                </div>
                <div className="space-y-2 w-full">
                  <h3 className="font-medium text-lg">Processing File...</h3>
                  <Progress value={progress} className="w-full h-2" />
                  <p className="text-sm text-muted-foreground">
                    {progress < 40 ? 'Reading file...' : 
                     progress < 70 ? 'Parsing data...' : 
                     'Preprocessing data...'}
                  </p>
                </div>
              </>
            )}
            
            {uploadStatus === 'success' && (
              <>
                <div className="h-14 w-14 rounded-full bg-reforest/20 flex items-center justify-center">
                  <FileSpreadsheet size={24} className="text-reforest" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium text-lg text-reforest">File Uploaded Successfully</h3>
                  <p className="text-sm text-muted-foreground">
                    Your forest data has been processed and is ready for analysis
                  </p>
                </div>
                <Button type="button" variant="outline" className="mt-2" onClick={() => setUploadStatus('idle')}>
                  Upload Another File
                </Button>
              </>
            )}
            
            {uploadStatus === 'error' && (
              <>
                <div className="h-14 w-14 rounded-full bg-destructive/20 flex items-center justify-center">
                  <AlertCircle size={24} className="text-destructive" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium text-lg text-destructive">Upload Failed</h3>
                  <p className="text-sm text-muted-foreground">
                    {error || 'An error occurred while uploading the file.'}
                  </p>
                </div>
                <Button type="button" variant="outline" className="mt-2" onClick={() => setUploadStatus('idle')}>
                  Try Again
                </Button>
              </>
            )}
          </div>
        </div>

        {uploadStatus === 'idle' && (
          <div className="space-y-4 mt-4">
            <Alert variant="default">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Sample Data Format</AlertTitle>
              <AlertDescription className="text-xs font-mono mt-2 overflow-x-auto">
                state,year,deforestation,reforestation<br />
                Maharashtra,2018,120.5,75.2<br />
                Karnataka,2018,93.7,105.8<br />
                Kerala,2019,45.2,65.9
              </AlertDescription>
            </Alert>
            
            <div className="text-center">
              <a 
                href="/sample-forest-data.csv" 
                download 
                className="text-sm text-forest hover:text-forest-dark underline inline-flex items-center"
              >
                <FileText className="h-4 w-4 mr-1" />
                Download Sample Data File
              </a>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FileUpload;
