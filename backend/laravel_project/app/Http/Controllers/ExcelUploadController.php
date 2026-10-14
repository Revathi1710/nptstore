<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Project;
use App\Models\PdfFile;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use PhpOffice\PhpSpreadsheet\Shared\Date as ExcelDate;

class ExcelUploadController extends Controller
{
    public function uploadExcel(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv',
        ]);

      ini_set('max_execution_time', 600); // 10 minutes
ini_set('memory_limit', '1G');      // 1 Gigabyte

        $rows = Excel::toArray([], $request->file('file'))[0];

        $data = [];
        foreach ($rows as $key => $row) {
            if ($key === 0) continue;

            $rowValues = array_filter($row, fn($v) => !is_null($v) && $v !== '');
            if (empty($rowValues)) continue;

            $addedDate = null;
            if (!empty($row[21])) {
                try {
                    if (is_numeric($row[21])) {
                        $addedDate = ExcelDate::excelToDateTimeObject($row[21])->format('Y-m-d');
                    } else {
                        $parsed = strtotime($row[21]);
                        $addedDate = $parsed ? date('Y-m-d', $parsed) : null;
                    }
                } catch (\Exception $e) {
                    $addedDate = null;
                }
            }

            $data[] = [
                'company'             => isset($row[0]) ? (string)$row[0] : null,
                'project'             => isset($row[1]) ? (string)$row[1] : null,
                'project_type'        => isset($row[2]) ? (string)$row[2] : null,
                'ownership'           => isset($row[3]) ? (string)$row[3] : null,
                'industry'            => isset($row[4]) ? (string)$row[4] : null,
                'project_cost'        => isset($row[5]) ? (string)$row[5] : null,
                'products_capacity'   => isset($row[6]) ? (string)$row[6] : null,
                'completion_schedule' => isset($row[7]) ? (string)$row[7] : null,
                'project_stage'       => isset($row[8]) ? (string)$row[8] : null,
                'location'            => isset($row[9]) ? (string)$row[9] : null,
                'district'            => isset($row[10]) ? (string)$row[10] : null,
                'project_state'       => isset($row[11]) ? (string)$row[11] : null,
                'project_history'     => isset($row[12]) ? (string)$row[12] : null,
                'address'             => isset($row[13]) ? (string)$row[13] : null,
                'city'                => isset($row[14]) ? (string)$row[14] : null,
                'pincode'             => isset($row[15]) ? (string)$row[15] : null,
                'addr_state'          => isset($row[16]) ? (string)$row[16] : null,
                'telephone'           => isset($row[17]) ? (string)$row[17] : null,
                'email'               => isset($row[18]) ? (string)$row[18] : null,
                'person_name_1'       => isset($row[19]) ? (string)$row[19] : null,
                'person_name_2'       => isset($row[20]) ? (string)$row[20] : null,
                'added_date'          => $addedDate,
                'created_at'          => now(),
                'updated_at'          => now(),
            ];
        }

        if (empty($data)) {
            return response()->json(['message' => 'No valid data found in the file.'], 422);
        }

        // Insert data first
        foreach (array_chunk($data, 500) as $chunk) {
            Project::insert($chunk);
        }

        // Generate PDF in chunks of 50 rows per PDF to avoid timeout
        $filename = 'projects_' . time() . '.pdf';
        $pdfPath = storage_path('app/public/' . $filename);

        // Make sure storage/app/public exists
        if (!file_exists(storage_path('app/public'))) {
            mkdir(storage_path('app/public'), 0755, true);
        }

        // Only generate PDF for first 50 rows to avoid timeout
        // For large files, generate in background (queue) — for now limit to 50
        $pdfRows = array_slice($data, 0,500);

        try {
            $pdf = Pdf::loadView('pdf_template', ['rows' => $pdfRows]);
            $pdf->setPaper('A4', 'portrait');
            $pdf->save($pdfPath); // Save to file instead of storing base64 in DB

            PdfFile::create([
                'filename'   => $filename,
                'pdf_base64' => base64_encode(file_get_contents($pdfPath)),
            ]);

            // Clean up file after storing in DB
            unlink($pdfPath);

        } catch (\Exception $e) {
            \Log::error('PDF generation failed: ' . $e->getMessage());
        }

        return response()->json([
            'message'       => 'Excel uploaded and PDF stored successfully',
            'total_records' => count($data),
        ]);
    }
}