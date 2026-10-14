<!DOCTYPE html>
<html>
<head>
    <title>Projects PDF</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 12px; color: #333; }

        .page {
            page-break-after: always;
            padding: 30px 40px;
            min-height: 100vh;
        }
        .page:last-child { page-break-after: avoid; }

        /* Header */
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .header .logo-area {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .logo-box {
            width: 60px;
            height: 60px;
            background: #1a73e8;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 10px;
            font-weight: bold;
            text-align: center;
            padding: 4px;
        }
        .company-name {
            font-size: 16px;
            font-weight: bold;
            color: #1a73e8;
        }
        .company-address {
            font-size: 9px;
            color: #666;
            margin-top: 3px;
        }

        /* Project Title */
        .project-title {
            font-size: 15px;
            font-weight: bold;
            color: #222;
            margin-bottom: 15px;
            border-bottom: 1px solid #ccc;
            padding-bottom: 8px;
        }

        /* Section Heading */
        .section-heading {
            font-size: 12px;
            font-weight: bold;
            color: #cc0000;
            margin: 14px 0 6px 0;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }

        /* Updated On */
        .updated-on {
            font-size: 10px;
            color: #555;
            text-align: right;
            margin-bottom: 5px;
        }

        /* Details Table */
        .details-table {
            width: 100%;
            border-collapse: collapse;
        }
        .details-table tr td {
            padding: 5px 8px;
            font-size: 11px;
            vertical-align: top;
        }
        .details-table tr td:first-child {
            font-weight: bold;
            width: 40%;
            color: #333;
        }
        .details-table tr:nth-child(even) {
            background-color: #f9f9f9;
        }

        /* Project History */
        .history-text {
            font-size: 11px;
            line-height: 1.6;
            color: #444;
            margin-top: 5px;
            text-align: justify;
        }

        /* Contact Section */
        .contact-block {
            margin-top: 5px;
            font-size: 11px;
            line-height: 1.8;
        }
        .contact-block strong {
            display: block;
            font-size: 12px;
            margin-bottom: 2px;
        }

        /* Footer */
        .footer {
            margin-top: 30px;
            border-top: 1px solid #ccc;
            padding-top: 6px;
            font-size: 9px;
            color: #888;
            text-align: center;
        }
    </style>
</head>
<body>

@foreach($rows as $index => $row)
<div class="page">

    {{-- Header --}}
    <div class="header">
    <div class="logo-area">
        <img src="{{ public_path('images/logo.png') }}" 
             style="width: 60px; height: 60px; object-fit: contain;" 
             alt="Logo">
        <div>
            <div class="company-name">New Projects Tracker Research Information Services</div>
            <div class="company-address">
                Plot #7A, 1st floor, saraswathi colony, Stage II Extn., Chinmaya Nagar, Chennai 600092, Tamil Nadu (India)
            </div>
        </div>
    </div>
</div>

    {{-- Project Title --}}
    <div class="project-title">{{ $row['project'] ?? 'N/A' }}</div>

    {{-- Updated On --}}
    <div class="updated-on">Updated On : {{ now()->format('d M, Y') }}</div>

    {{-- Project Basic Details --}}
    <div class="section-heading">Project Basic Details</div>
    <table class="details-table">
        <tr>
            <td>Promoter</td>
            <td>{{ $row['company'] ?? 'N/A' }}</td>
        </tr>
        <tr>
            <td>Project Type</td>
            <td>{{ $row['project_type'] ?? 'N/A' }}</td>
        </tr>
        <tr>
            <td>Ownership</td>
            <td>{{ $row['ownership'] ?? 'N/A' }}</td>
        </tr>
        <tr>
            <td>Industry</td>
            <td>{{ $row['industry'] ?? 'N/A' }}</td>
        </tr>
        <tr>
            <td>Project Investment</td>
            <td>{{ $row['project_cost'] ?? 'N/A' }}</td>
        </tr>
        <tr>
            <td>Project Stage</td>
            <td>{{ $row['project_stage'] ?? 'N/A' }}</td>
        </tr>
        <tr>
            <td>Products &amp; Capacity</td>
            <td>{{ $row['products_capacity'] ?? 'N/A' }}</td>
        </tr>
        <tr>
            <td>Expected Completion</td>
            <td>{{ $row['completion_schedule'] ?? 'N/A' }}</td>
        </tr>
    </table>

    {{-- Project Location --}}
    <div class="section-heading">Project Location</div>
    <table class="details-table">
        <tr>
            <td>Location</td>
            <td>{{ $row['location'] ?? 'N/A' }}</td>
        </tr>
        <tr>
            <td>District</td>
            <td>{{ $row['district'] ?? 'N/A' }}</td>
        </tr>
        <tr>
            <td>State</td>
            <td>{{ $row['project_state'] ?? 'N/A' }}</td>
        </tr>
    </table>

    {{-- Project History / Details --}}
    @if(!empty($row['project_history']))
    <div class="section-heading">Project Details</div>
    <div class="history-text">{{ $row['project_history'] }}</div>
    @endif

    {{-- Contact Details --}}
    <div class="section-heading">Contact Details</div>
    <div class="contact-block">
        <strong>{{ $row['company'] ?? '' }} (Corporate Office)</strong>
        {{ $row['address'] ?? '' }}<br>
        {{ $row['city'] ?? '' }}
        @if(!empty($row['pincode'])) - {{ $row['pincode'] }} @endif
        <br>
        {{ $row['addr_state'] ?? '' }}<br>
        @if(!empty($row['telephone']))
            Telephone : {{ $row['telephone'] }}<br>
        @endif
        @if(!empty($row['email']))
            Email : {{ $row['email'] }}<br>
        @endif

        @if(!empty($row['person_name_1']) || !empty($row['person_name_2']))
            <br><strong>Contact Person :</strong>
            @if(!empty($row['person_name_1'])) {{ $row['person_name_1'] }}<br> @endif
            @if(!empty($row['person_name_2'])) {{ $row['person_name_2'] }}<br> @endif
        @endif
    </div>

    {{-- Footer --}}
    <div class="footer">
        © New Projects Tracker Research Information Services. Chennai. &nbsp;|&nbsp; Page {{ $index + 1 }}
    </div>

</div>
@endforeach

</body>
</html>