import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ExcelInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ExcelInterceptor.name);

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const file: Express.Multer.File = request.file;

    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Check if file is xlsx
    if (
      file.mimetype !==
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      throw new BadRequestException(
        'Invalid file format. Please upload an XLSX file.',
      );
    }

    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(file.buffer);

      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        throw new BadRequestException(
          'No worksheet found in the uploaded file',
        );
      }

      const rows: Record<string, string>[] = [];
      let headers: string[] = [];

      console.debug('Processing worksheet:', worksheet.name);

      // Process rows
      worksheet.eachRow((row: ExcelJS.Row, rowNumber: number) => {
        if (rowNumber === 1) {
          // Get headers from first row
          row.eachCell((cell: ExcelJS.Cell, colNumber: number) => {
            headers[colNumber - 1] = cell.value?.toString().trim() || '';
          });
        } else {
          // Process data rows
          const rowData: Record<string, string> = {};
          row.eachCell((cell: ExcelJS.Cell, colNumber: number) => {
            const header = headers[colNumber - 1];
            if (header) {
              // Handle different cell value types
              let cellValue = '';
              if (cell.value) {
                if (
                  typeof cell.value === 'object' &&
                  'type' in cell.value &&
                  cell.value.type === 'formula'
                ) {
                  // Handle formula results
                  cellValue =
                    (
                      cell.value as ExcelJS.CellFormulaValue
                    ).result?.toString() || '';
                } else if (
                  typeof cell.value === 'object' &&
                  'text' in cell.value
                ) {
                  // Handle rich text
                  cellValue = (cell.value as any).text;
                } else if (cell.value instanceof Date) {
                  // Handle dates
                  cellValue = cell.value.toISOString();
                } else {
                  // Handle other types
                  cellValue = cell.value.toString();
                }
              }
              rowData[header] = cellValue || '';
            }
          });

          // Only add rows that have data
          if (Object.keys(rowData).length > 0) {
            rows.push(rowData);
          }
        }
      });

      if (rows.length > 0) {
        this.logger.debug('First row headers:', headers);
        this.logger.debug('Sample row data:', JSON.stringify(rows[0], null, 2));
      }
      console.log('ROWS:', rows);

      request.body.data = rows;
      return next.handle();
    } catch (error) {
      this.logger.error('Error processing Excel file:', error);
      throw new BadRequestException('Error processing Excel file');
    }
  }
}
