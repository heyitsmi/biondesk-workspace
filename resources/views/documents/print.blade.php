<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>{{ $doc['kindLabel'] }} {{ $doc['number'] }}</title>
    <style>
        @page {
            margin: 0;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            padding: 50px 60px;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 13px;
            color: #1a1a1a;
            line-height: 1.5;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
        }

        .business h1 {
            font-size: 20px;
            margin: 0 0 6px;
        }

        .business p {
            margin: 0;
            color: #6b6b6b;
            white-space: pre-line;
        }

        .meta {
            text-align: right;
        }

        .meta .row {
            display: flex;
            justify-content: flex-end;
            gap: 24px;
            margin-bottom: 6px;
        }

        .meta .label {
            color: #6b6b6b;
            text-transform: uppercase;
            font-size: 10.5px;
            letter-spacing: 0.04em;
        }

        .meta .value {
            font-weight: 600;
        }

        .meta .value.danger {
            color: #c0392b;
        }

        .recipient {
            margin-bottom: 40px;
        }

        .recipient .label {
            color: #6b6b6b;
            text-transform: uppercase;
            font-size: 10.5px;
            letter-spacing: 0.04em;
            margin-bottom: 6px;
        }

        .recipient h2 {
            font-size: 15px;
            margin: 0 0 4px;
        }

        .recipient p {
            margin: 0;
            color: #6b6b6b;
            white-space: pre-line;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
        }

        th {
            text-align: left;
            font-size: 10.5px;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            color: #6b6b6b;
            border-bottom: 2px solid #e2e2e2;
            padding: 10px 12px;
        }

        th.number,
        td.number {
            text-align: right;
        }

        td {
            border-bottom: 1px solid #e2e2e2;
            padding: 14px 12px;
            vertical-align: top;
        }

        td .desc {
            color: #6b6b6b;
            font-size: 11.5px;
            margin-top: 4px;
        }

        .totals {
            margin-left: auto;
            width: 280px;
        }

        .totals .row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            color: #6b6b6b;
        }

        .totals .row.total {
            border-top: 1px solid #e2e2e2;
            margin-top: 6px;
            padding-top: 12px;
            font-weight: 700;
            color: #1a1a1a;
            font-size: 15px;
        }

        .totals .row.due {
            background: #fbe9e7;
            padding: 12px;
            border-radius: 6px;
            font-weight: 700;
            font-size: 15px;
            color: #1a1a1a;
        }

        .notes {
            border-top: 1px dashed #e2e2e2;
            padding-top: 24px;
            margin-top: 32px;
        }

        .notes .label {
            color: #6b6b6b;
            text-transform: uppercase;
            font-size: 10.5px;
            letter-spacing: 0.04em;
            margin-bottom: 8px;
        }

        .notes p {
            margin: 0;
            color: #6b6b6b;
            white-space: pre-line;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="business">
            <h1>{{ $doc['business']['name'] }}</h1>
            <p>{{ $doc['business']['address'] }}{{ $doc['business']['email'] ? "\n".$doc['business']['email'] : '' }}</p>
        </div>
        <div class="meta">
            @foreach ($doc['dateFields'] as $field)
                <div class="row">
                    <span class="label">{{ $field['label'] }}</span>
                    <span class="value {{ $field['danger'] ? 'danger' : '' }}">{{ $field['value'] }}</span>
                </div>
            @endforeach
        </div>
    </div>

    <div class="recipient">
        <div class="label">{{ $doc['recipient']['label'] }}</div>
        <h2>{{ $doc['recipient']['name'] }}</h2>
        <p>Attn: {{ $doc['recipient']['attn'] }}
{{ $doc['recipient']['address'] }}
{{ $doc['recipient']['email'] }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Item &amp; Description</th>
                <th class="number">Qty</th>
                <th class="number">Price</th>
                <th class="number">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($doc['lineItems'] as $item)
                <tr>
                    <td>
                        {{ $item['name'] }}
                        @if ($item['description'])
                            <div class="desc">{{ $item['description'] }}</div>
                        @endif
                    </td>
                    <td class="number">{{ $item['qty'] }}</td>
                    <td class="number">{{ $item['price'] }}</td>
                    <td class="number">{{ $item['total'] }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="totals">
        <div class="row">
            <span>Subtotal</span>
            <span>{{ $doc['subtotal'] }}</span>
        </div>
        <div class="row">
            <span>{{ $doc['adjustmentLabel'] }}</span>
            <span>{{ $doc['adjustmentAmount'] }}</span>
        </div>
        <div class="row total">
            <span>{{ $doc['totalLabel'] }}</span>
            <span>{{ $doc['total'] }}</span>
        </div>
        @if ($doc['amountPaid'] !== null)
            <div class="row">
                <span>Amount Paid</span>
                <span>-{{ $doc['amountPaid'] }}</span>
            </div>
        @endif
        @if ($doc['amountDue'] !== null)
            <div class="row due">
                <span>Amount Due</span>
                <span>{{ $doc['amountDue'] }}</span>
            </div>
        @endif
    </div>

    <div class="notes">
        <div class="label">{{ $doc['notesLabel'] }}</div>
        <p>{{ $doc['notes'] }}</p>
    </div>
</body>
</html>
