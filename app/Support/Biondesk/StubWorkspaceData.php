<?php

namespace App\Support\Biondesk;

use App\Models\Team;

class StubWorkspaceData
{
    /**
     * Get the stubbed dashboard page data.
     *
     * @return array<string, mixed>
     */
    public function dashboard(Team $team): array
    {
        return [
            'stats' => [
                ['label' => 'Pipeline Value', 'value' => '$47,200', 'change' => '12% vs last month', 'tone' => 'success'],
                ['label' => 'To Be Collected', 'value' => '$8,450', 'change' => '2 invoices overdue', 'tone' => 'danger'],
                ['label' => 'Active Projects', 'value' => '6', 'change' => '2 waiting on client', 'tone' => 'muted'],
                ['label' => 'Win Rate', 'value' => '68%', 'change' => 'Based on last 12 deals', 'tone' => 'muted'],
            ],
            'priorityActions' => [
                [
                    'id' => 1,
                    'title' => 'Invoice INV-0043 is 5 days overdue',
                    'company' => 'Wayne Enterprises',
                    'amount' => '$12,000',
                    'actionLabel' => 'Send Reminder',
                    'tone' => 'danger',
                ],
                [
                    'id' => 2,
                    'title' => 'Fintech Brand Identity waiting on client for 8 days',
                    'company' => 'Nexus Corp',
                    'amount' => '$8,500',
                    'actionLabel' => 'Nudge Client',
                    'tone' => 'accent',
                ],
                [
                    'id' => 3,
                    'title' => 'Web App Redesign lead has had no activity for 6 days',
                    'company' => 'Acme Corp',
                    'amount' => '$5,000',
                    'actionLabel' => 'Follow Up',
                    'tone' => 'accent',
                ],
            ],
            'recentOpportunities' => [
                [
                    'id' => 1,
                    'title' => 'Web App Redesign',
                    'client' => 'Acme Corp',
                    'amount' => '$5,000',
                    'stageLabel' => 'Inbox',
                    'tone' => 'muted',
                ],
                [
                    'id' => 2,
                    'title' => 'Fintech Brand Identity',
                    'client' => 'Nexus Corp',
                    'amount' => '$8,500',
                    'stageLabel' => 'Negotiation',
                    'tone' => 'accent',
                ],
                [
                    'id' => 3,
                    'title' => 'Marketing Site',
                    'client' => 'Wayne Ent.',
                    'amount' => '$12,000',
                    'stageLabel' => 'Won',
                    'tone' => 'success',
                ],
                [
                    'id' => 4,
                    'title' => 'E-commerce Backend',
                    'client' => 'Retail Co',
                    'amount' => '$12,000',
                    'stageLabel' => 'Drafting',
                    'tone' => 'muted',
                ],
            ],
            'activityFeed' => [
                ['title' => 'Proposal sent to Nexus Corp', 'when' => '2 hours ago', 'tone' => 'accent'],
                ['title' => 'Payment received for INV-0041 ($3,200)', 'when' => '5 hours ago', 'tone' => 'success'],
                ['title' => 'New lead via public form: Retail Co', 'when' => 'Yesterday', 'tone' => 'muted'],
                ['title' => 'Task completed: Database schema', 'when' => '2 days ago', 'tone' => 'muted'],
            ],
        ];
    }

    /**
     * Get the stubbed opportunities page data.
     *
     * @return array<string, mixed>
     */
    public function opportunities(Team $team): array
    {
        return [
            'defaultView' => 'board',
            'summary' => [
                'openCount' => '8',
                'winRate' => '38%',
                'averageValue' => '$7.7k',
            ],
            'stages' => [
                ['key' => 'inbox', 'label' => 'Inbox', 'tone' => 'muted'],
                ['key' => 'drafting', 'label' => 'Drafting', 'tone' => 'muted'],
                ['key' => 'sent', 'label' => 'Sent', 'tone' => 'muted'],
                ['key' => 'negotiation', 'label' => 'Negotiation', 'tone' => 'accent'],
                ['key' => 'won', 'label' => 'Won', 'tone' => 'success'],
                ['key' => 'lost', 'label' => 'Lost', 'tone' => 'danger'],
            ],
            'opportunities' => [
                [
                    'id' => 1,
                    'title' => 'Web App Redesign',
                    'company' => 'Acme Corp',
                    'contact' => 'Claire Moss',
                    'source' => 'Upwork',
                    'amount' => '$5,000',
                    'amountValue' => 5000,
                    'stage' => 'inbox',
                    'stageLabel' => 'Inbox',
                    'tone' => 'muted',
                    'lastActivity' => '2d ago',
                    'activityOrder' => 2,
                    'summary' => 'Initial brief received, waiting on scope clarification from client before sending formal quote.',
                ],
                [
                    'id' => 2,
                    'title' => 'Mobile App MVP',
                    'company' => 'Kevin Studio',
                    'contact' => 'Kevin Studio',
                    'source' => 'Referral',
                    'amount' => '$15,000',
                    'amountValue' => 15000,
                    'stage' => 'inbox',
                    'stageLabel' => 'Inbox',
                    'tone' => 'muted',
                    'lastActivity' => '1d ago',
                    'activityOrder' => 1,
                    'summary' => 'Discovery call complete and budget confirmed. Needs proposal structure before moving forward.',
                ],
                [
                    'id' => 3,
                    'title' => 'E-commerce Backend',
                    'company' => 'Retail Co',
                    'contact' => 'Jules Harmon',
                    'source' => 'LinkedIn',
                    'amount' => '$12,000',
                    'amountValue' => 12000,
                    'stage' => 'drafting',
                    'stageLabel' => 'Drafting',
                    'tone' => 'muted',
                    'lastActivity' => '4d ago',
                    'activityOrder' => 4,
                    'summary' => 'Drafting proposal from discovery notes and early technical scoping.',
                ],
                [
                    'id' => 4,
                    'title' => 'Portfolio Website',
                    'company' => 'Jane Doe',
                    'contact' => 'Jane Doe',
                    'source' => 'Direct',
                    'amount' => '$3,200',
                    'amountValue' => 3200,
                    'stage' => 'sent',
                    'stageLabel' => 'Sent',
                    'tone' => 'muted',
                    'lastActivity' => '3d ago',
                    'activityOrder' => 3,
                    'summary' => 'Proposal sent and waiting for client review before follow-up.',
                ],
                [
                    'id' => 5,
                    'title' => 'API Integration',
                    'company' => 'Globex',
                    'contact' => 'Nora Patel',
                    'source' => 'Upwork',
                    'amount' => '$6,800',
                    'amountValue' => 6800,
                    'stage' => 'sent',
                    'stageLabel' => 'Sent',
                    'tone' => 'muted',
                    'lastActivity' => '6d ago',
                    'activityOrder' => 6,
                    'summary' => 'Technical proposal delivered with estimated integration timeline and handoff plan.',
                ],
                [
                    'id' => 6,
                    'title' => 'Fintech Brand Identity',
                    'company' => 'Nexus Corp',
                    'contact' => 'Eli Ward',
                    'source' => 'Referral',
                    'amount' => '$8,500',
                    'amountValue' => 8500,
                    'stage' => 'negotiation',
                    'stageLabel' => 'Negotiation',
                    'tone' => 'accent',
                    'lastActivity' => '8d ago',
                    'activityOrder' => 8,
                    'summary' => 'Client likes direction, waiting on final approval before converting to signed scope.',
                ],
                [
                    'id' => 7,
                    'title' => 'Marketing Site',
                    'company' => 'Wayne Ent.',
                    'contact' => 'Victor Lane',
                    'source' => 'Upwork',
                    'amount' => '$12,000',
                    'amountValue' => 12000,
                    'stage' => 'won',
                    'stageLabel' => 'Won',
                    'tone' => 'success',
                    'lastActivity' => '12d ago',
                    'activityOrder' => 12,
                    'summary' => "Deal confirmed and ready to become an active project in {$team->name}.",
                ],
                [
                    'id' => 8,
                    'title' => 'Legacy System Migration',
                    'company' => 'Initech',
                    'contact' => 'Omar Vega',
                    'source' => 'Upwork',
                    'amount' => '$9,000',
                    'amountValue' => 9000,
                    'stage' => 'lost',
                    'stageLabel' => 'Lost',
                    'tone' => 'danger',
                    'lastActivity' => '15d ago',
                    'activityOrder' => 15,
                    'summary' => 'Timeline mismatch and internal team decided to pause migration work this quarter.',
                ],
            ],
        ];
    }

    /**
     * Get the stubbed projects page data.
     *
     * @return array<string, mixed>
     */
    public function projects(Team $team): array
    {
        return [
            'defaultView' => 'board',
            'summary' => [
                'activeCount' => '6',
                'waitingCount' => '1',
                'completionRate' => '74%',
            ],
            'stages' => [
                ['key' => 'not_started', 'label' => 'Not Started', 'tone' => 'muted'],
                ['key' => 'in_progress', 'label' => 'In Progress', 'tone' => 'muted'],
                ['key' => 'waiting_on_client', 'label' => 'Waiting on Client', 'tone' => 'accent'],
                ['key' => 'in_review', 'label' => 'In Review', 'tone' => 'muted'],
                ['key' => 'completed', 'label' => 'Completed', 'tone' => 'success'],
                ['key' => 'cancelled', 'label' => 'Cancelled', 'tone' => 'danger'],
            ],
            'projects' => [
                [
                    'id' => 11,
                    'title' => 'Portfolio Redesign',
                    'client' => 'Jane Doe',
                    'stage' => 'not_started',
                    'stageLabel' => 'Not Started',
                    'tone' => 'muted',
                    'progress' => 0,
                    'dueAt' => 'Jul 28',
                    'dueOrder' => 28,
                    'budget' => '$0',
                    'requestLogCount' => 0,
                    'tasks' => [
                        ['id' => 1, 'title' => 'Gather requirements', 'done' => false],
                        ['id' => 2, 'title' => 'Wireframe homepage', 'done' => false],
                        ['id' => 3, 'title' => 'Design system setup', 'done' => false],
                        ['id' => 4, 'title' => 'Client kickoff call', 'done' => false],
                    ],
                    'requestLogs' => [],
                ],
                [
                    'id' => 12,
                    'title' => 'Fintech Brand Identity',
                    'client' => 'Nexus Corp',
                    'stage' => 'in_progress',
                    'stageLabel' => 'In Progress',
                    'tone' => 'muted',
                    'progress' => 50,
                    'dueAt' => 'Jul 20',
                    'dueOrder' => 20,
                    'budget' => '$0',
                    'requestLogCount' => 1,
                    'tasks' => [
                        ['id' => 5, 'title' => 'Logo concepts', 'done' => true],
                        ['id' => 6, 'title' => 'Color palette', 'done' => true],
                        ['id' => 7, 'title' => 'Typography system', 'done' => true],
                        ['id' => 8, 'title' => 'Brand guideline doc', 'done' => false],
                        ['id' => 9, 'title' => 'Business card mockup', 'done' => false],
                        ['id' => 10, 'title' => 'Final handoff', 'done' => false],
                    ],
                    'requestLogs' => [
                        ['id' => 1, 'message' => 'Can we see the logo in a darker navy instead of black?', 'createdAt' => '2 days ago'],
                    ],
                ],
                [
                    'id' => 13,
                    'title' => 'E-commerce Backend',
                    'client' => 'Retail Co',
                    'stage' => 'waiting_on_client',
                    'stageLabel' => 'Waiting on Client',
                    'tone' => 'accent',
                    'progress' => 63,
                    'dueAt' => 'Jul 15',
                    'dueOrder' => 15,
                    'budget' => '$0',
                    'requestLogCount' => 0,
                    'tasks' => [
                        ['id' => 11, 'title' => 'Database schema', 'done' => true],
                        ['id' => 12, 'title' => 'Product API', 'done' => true],
                        ['id' => 13, 'title' => 'Cart & checkout', 'done' => true],
                        ['id' => 14, 'title' => 'Payment integration', 'done' => true],
                        ['id' => 15, 'title' => 'Admin dashboard', 'done' => true],
                        ['id' => 16, 'title' => 'Inventory sync', 'done' => false],
                        ['id' => 17, 'title' => 'Load testing', 'done' => false],
                        ['id' => 18, 'title' => 'Deploy to production', 'done' => false],
                    ],
                    'requestLogs' => [],
                ],
                [
                    'id' => 14,
                    'title' => 'API Integration Layer',
                    'client' => 'Globex',
                    'stage' => 'in_review',
                    'stageLabel' => 'In Review',
                    'tone' => 'muted',
                    'progress' => 100,
                    'dueAt' => 'Jul 10',
                    'dueOrder' => 10,
                    'budget' => '$0',
                    'requestLogCount' => 2,
                    'tasks' => [
                        ['id' => 19, 'title' => 'Auth middleware', 'done' => true],
                        ['id' => 20, 'title' => 'Rate limiting', 'done' => true],
                        ['id' => 21, 'title' => 'Webhook handlers', 'done' => true],
                        ['id' => 22, 'title' => 'Error logging', 'done' => true],
                        ['id' => 23, 'title' => 'Docs', 'done' => true],
                        ['id' => 24, 'title' => 'Client review', 'done' => true],
                        ['id' => 25, 'title' => 'Final sign-off', 'done' => true],
                    ],
                    'requestLogs' => [
                        ['id' => 2, 'message' => 'Can we add a retry mechanism for failed webhook deliveries?', 'createdAt' => '5 hours ago'],
                        ['id' => 3, 'message' => 'Please add rate limit headers to the response.', 'createdAt' => 'Yesterday'],
                    ],
                ],
                [
                    'id' => 15,
                    'title' => 'Marketing Site',
                    'client' => 'Wayne Ent.',
                    'stage' => 'completed',
                    'stageLabel' => 'Completed',
                    'tone' => 'success',
                    'progress' => 100,
                    'dueAt' => 'Jul 05',
                    'dueOrder' => 5,
                    'budget' => '$0',
                    'requestLogCount' => 0,
                    'tasks' => [
                        ['id' => 26, 'title' => 'Homepage design', 'done' => true],
                        ['id' => 27, 'title' => 'CMS setup', 'done' => true],
                        ['id' => 28, 'title' => 'SEO pass', 'done' => true],
                        ['id' => 29, 'title' => 'Analytics', 'done' => true],
                        ['id' => 30, 'title' => 'Launch', 'done' => true],
                        ['id' => 31, 'title' => 'Handoff docs', 'done' => true],
                    ],
                    'requestLogs' => [],
                ],
                [
                    'id' => 16,
                    'title' => 'Legacy System Migration',
                    'client' => 'Initech',
                    'stage' => 'cancelled',
                    'stageLabel' => 'Cancelled',
                    'tone' => 'danger',
                    'progress' => 20,
                    'dueAt' => 'Jul 03',
                    'dueOrder' => 3,
                    'budget' => '$0',
                    'requestLogCount' => 0,
                    'tasks' => [
                        ['id' => 32, 'title' => 'Audit legacy DB', 'done' => true],
                        ['id' => 33, 'title' => 'Migration plan', 'done' => true],
                        ['id' => 34, 'title' => 'Data mapping', 'done' => false],
                        ['id' => 35, 'title' => 'Test migration', 'done' => false],
                        ['id' => 36, 'title' => 'Rollback plan', 'done' => false],
                        ['id' => 37, 'title' => 'Staging run', 'done' => false],
                        ['id' => 38, 'title' => 'Prod run', 'done' => false],
                        ['id' => 39, 'title' => 'Cutover', 'done' => false],
                        ['id' => 40, 'title' => 'Cleanup', 'done' => false],
                        ['id' => 41, 'title' => 'Docs', 'done' => false],
                    ],
                    'requestLogs' => [],
                ],
            ],
        ];
    }

    /**
     * Get the stubbed project detail page data.
     *
     * @return array<string, mixed>|null
     */
    public function projectDetail(Team $team, int $projectId): ?array
    {
        $projectsPage = $this->projects($team);
        $project = null;

        foreach ($projectsPage['projects'] as $candidate) {
            if (($candidate['id'] ?? null) === $projectId) {
                $project = $candidate;
                break;
            }
        }

        if ($project === null) {
            return null;
        }

        $detailRecords = $this->projectDetailRecords($team);
        $detail = $detailRecords[$projectId] ?? $this->genericProjectDetailRecord($project, $team);

        return [
            'project' => [
                'id' => $project['id'],
                'title' => $project['title'],
                'client' => $project['client'],
                'stage' => $project['stage'],
                'stageLabel' => $project['stageLabel'],
                'tone' => $project['tone'],
                'dueAt' => $project['dueAt'],
                'description' => $detail['description'],
                'tasks' => $detail['tasks'],
                'requestLogs' => $detail['requestLogs'],
                'activity' => $detail['activity'],
            ],
            'stages' => $projectsPage['stages'],
            'defaultTaskView' => 'board',
            'taskStages' => [
                ['key' => 'backlog', 'label' => 'Backlog', 'tone' => 'muted'],
                ['key' => 'todo', 'label' => 'To Do', 'tone' => 'muted'],
                ['key' => 'in_progress', 'label' => 'In Progress', 'tone' => 'accent'],
                ['key' => 'in_review', 'label' => 'In Review', 'tone' => 'accent'],
                ['key' => 'done', 'label' => 'Done', 'tone' => 'success'],
            ],
        ];
    }

    /**
     * Get custom project detail records keyed by project ID.
     *
     * @return array<int, array<string, mixed>>
     */
    private function projectDetailRecords(Team $team): array
    {
        return [
            11 => [
                'description' => 'Portfolio redesign and launch support for a solo creator brand refresh.',
                'tasks' => [
                    ['id' => 1101, 'title' => 'Gather references', 'status' => 'backlog', 'description' => '', 'tags' => ['Research'], 'attachments' => []],
                    ['id' => 1102, 'title' => 'Draft sitemap', 'status' => 'todo', 'description' => '', 'tags' => ['Planning'], 'attachments' => []],
                    ['id' => 1103, 'title' => 'Moodboard review', 'status' => 'todo', 'description' => '', 'tags' => ['Design'], 'attachments' => []],
                    ['id' => 1104, 'title' => 'Kickoff call', 'status' => 'todo', 'description' => '', 'tags' => ['Client'], 'attachments' => []],
                ],
                'requestLogs' => [
                    ['id' => 1151, 'text' => 'Can we keep the visual language minimal and editorial?', 'source' => 'Email', 'date' => 'Yesterday', 'classification' => 'new', 'notes' => '', 'attachments' => []],
                ],
                'activity' => [
                    ['text' => 'Project created', 'time' => '2 days ago', 'tone' => 'muted'],
                    ['text' => 'Client preference added to request log', 'time' => 'Yesterday', 'tone' => 'accent'],
                ],
            ],
            12 => [
                'description' => 'Full brand identity package for Nexus Corp fintech app: logo, color system, typography, and guideline doc.',
                'tasks' => [
                    ['id' => 1201, 'title' => 'Logo concepts', 'status' => 'done', 'description' => 'Three initial directions explored, client picked direction B.', 'tags' => ['Design'], 'attachments' => [['name' => 'logo-concepts-v3.fig']]],
                    ['id' => 1202, 'title' => 'Color palette', 'status' => 'done', 'description' => '', 'tags' => ['Design'], 'attachments' => []],
                    ['id' => 1203, 'title' => 'Typography system', 'status' => 'done', 'description' => '', 'tags' => [], 'attachments' => []],
                    ['id' => 1204, 'title' => 'Brand guideline doc', 'status' => 'in_review', 'description' => 'Sent to client for approval, waiting on feedback.', 'tags' => ['Docs'], 'attachments' => []],
                    ['id' => 1205, 'title' => 'Business card mockup', 'status' => 'in_progress', 'description' => '', 'tags' => [], 'attachments' => []],
                    ['id' => 1206, 'title' => 'Final handoff', 'status' => 'todo', 'description' => '', 'tags' => [], 'attachments' => []],
                    ['id' => 1207, 'title' => 'Social media templates', 'status' => 'backlog', 'description' => '', 'tags' => [], 'attachments' => []],
                ],
                'requestLogs' => [
                    ['id' => 1251, 'text' => 'Can we see the logo in a darker navy instead of black?', 'source' => 'Email', 'date' => '2 days ago', 'classification' => 'new', 'notes' => '', 'attachments' => []],
                    ['id' => 1252, 'text' => 'Actually, let us keep the logo black like before.', 'source' => 'Phone call', 'date' => '1 day ago', 'classification' => 'contradiction', 'notes' => 'Client called after seeing the navy version and wants to revert.', 'attachments' => []],
                    ['id' => 1253, 'text' => 'Can the logo be a bit darker navy?', 'source' => 'WhatsApp', 'date' => '6 hours ago', 'classification' => 'duplicate', 'notes' => '', 'attachments' => [['name' => 'reference-navy.png']]],
                    ['id' => 1254, 'text' => 'Also curious if we can adjust the tagline font size.', 'source' => 'Telegram', 'date' => '3 hours ago', 'classification' => 'related', 'notes' => '', 'attachments' => []],
                ],
                'activity' => [
                    ['text' => 'Project created', 'time' => '12 days ago', 'tone' => 'muted'],
                    ['text' => 'Status changed to In Progress', 'time' => '9 days ago', 'tone' => 'accent'],
                    ['text' => 'Task "Logo concepts" marked done', 'time' => '5 days ago', 'tone' => 'success'],
                    ['text' => 'Task "Color palette" marked done', 'time' => '4 days ago', 'tone' => 'success'],
                    ['text' => 'New request log via Email', 'time' => '2 days ago', 'tone' => 'accent'],
                ],
            ],
            13 => [
                'description' => 'Backend implementation is almost complete and currently waiting on client-side API credentials.',
                'tasks' => [
                    ['id' => 1301, 'title' => 'Database schema', 'status' => 'done', 'description' => '', 'tags' => ['Backend'], 'attachments' => []],
                    ['id' => 1302, 'title' => 'Product API', 'status' => 'done', 'description' => '', 'tags' => ['Backend'], 'attachments' => []],
                    ['id' => 1303, 'title' => 'Cart & checkout', 'status' => 'done', 'description' => '', 'tags' => ['Backend'], 'attachments' => []],
                    ['id' => 1304, 'title' => 'Payment integration', 'status' => 'done', 'description' => '', 'tags' => ['Billing'], 'attachments' => []],
                    ['id' => 1305, 'title' => 'Admin dashboard', 'status' => 'done', 'description' => '', 'tags' => ['UI'], 'attachments' => []],
                    ['id' => 1306, 'title' => 'Inventory sync', 'status' => 'in_review', 'description' => 'Awaiting sandbox credentials from client.', 'tags' => ['Integration'], 'attachments' => []],
                    ['id' => 1307, 'title' => 'Load testing', 'status' => 'todo', 'description' => '', 'tags' => ['QA'], 'attachments' => []],
                    ['id' => 1308, 'title' => 'Deploy to production', 'status' => 'backlog', 'description' => '', 'tags' => ['Ops'], 'attachments' => []],
                ],
                'requestLogs' => [
                    ['id' => 1351, 'text' => 'We will send the payment gateway sandbox token tomorrow.', 'source' => 'Email', 'date' => '5 hours ago', 'classification' => 'new', 'notes' => '', 'attachments' => []],
                ],
                'activity' => [
                    ['text' => 'Project created', 'time' => '15 days ago', 'tone' => 'muted'],
                    ['text' => 'Status changed to Waiting on Client', 'time' => 'Today', 'tone' => 'accent'],
                ],
            ],
            14 => [
                'description' => 'API integration layer is complete and now under final client review before handoff.',
                'tasks' => [
                    ['id' => 1401, 'title' => 'Auth middleware', 'status' => 'done', 'description' => '', 'tags' => ['API'], 'attachments' => []],
                    ['id' => 1402, 'title' => 'Rate limiting', 'status' => 'done', 'description' => '', 'tags' => ['API'], 'attachments' => []],
                    ['id' => 1403, 'title' => 'Webhook handlers', 'status' => 'done', 'description' => '', 'tags' => ['Backend'], 'attachments' => []],
                    ['id' => 1404, 'title' => 'Error logging', 'status' => 'done', 'description' => '', 'tags' => ['Observability'], 'attachments' => []],
                    ['id' => 1405, 'title' => 'Docs', 'status' => 'done', 'description' => '', 'tags' => ['Docs'], 'attachments' => []],
                    ['id' => 1406, 'title' => 'Client review', 'status' => 'in_review', 'description' => 'Awaiting a final round of QA notes.', 'tags' => ['Client'], 'attachments' => []],
                    ['id' => 1407, 'title' => 'Final sign-off', 'status' => 'todo', 'description' => '', 'tags' => ['Client'], 'attachments' => []],
                ],
                'requestLogs' => [
                    ['id' => 1451, 'text' => 'Can we add a retry mechanism for failed webhook deliveries?', 'source' => 'Telegram', 'date' => '5 hours ago', 'classification' => 'related', 'notes' => '', 'attachments' => []],
                    ['id' => 1452, 'text' => 'Please add rate-limit headers to the response.', 'source' => 'Email', 'date' => 'Yesterday', 'classification' => 'new', 'notes' => '', 'attachments' => []],
                ],
                'activity' => [
                    ['text' => 'Project moved to In Review', 'time' => '2 days ago', 'tone' => 'accent'],
                    ['text' => 'Documentation bundle shared', 'time' => 'Yesterday', 'tone' => 'success'],
                ],
            ],
            15 => [
                'description' => 'Marketing site has been delivered and archived with all final handoff materials.',
                'tasks' => [
                    ['id' => 1501, 'title' => 'Homepage design', 'status' => 'done', 'description' => '', 'tags' => ['Design'], 'attachments' => []],
                    ['id' => 1502, 'title' => 'CMS setup', 'status' => 'done', 'description' => '', 'tags' => ['CMS'], 'attachments' => []],
                    ['id' => 1503, 'title' => 'SEO pass', 'status' => 'done', 'description' => '', 'tags' => ['SEO'], 'attachments' => []],
                    ['id' => 1504, 'title' => 'Analytics', 'status' => 'done', 'description' => '', 'tags' => ['Analytics'], 'attachments' => []],
                    ['id' => 1505, 'title' => 'Launch', 'status' => 'done', 'description' => '', 'tags' => ['Ops'], 'attachments' => []],
                    ['id' => 1506, 'title' => 'Handoff docs', 'status' => 'done', 'description' => '', 'tags' => ['Docs'], 'attachments' => []],
                ],
                'requestLogs' => [],
                'activity' => [
                    ['text' => 'Project marked completed', 'time' => '3 days ago', 'tone' => 'success'],
                    ['text' => 'Final invoice sent', 'time' => '2 days ago', 'tone' => 'accent'],
                ],
            ],
            16 => [
                'description' => 'Legacy migration was paused after early discovery because the scope and timing no longer aligned.',
                'tasks' => [
                    ['id' => 1601, 'title' => 'Audit legacy DB', 'status' => 'done', 'description' => '', 'tags' => ['Audit'], 'attachments' => []],
                    ['id' => 1602, 'title' => 'Migration plan', 'status' => 'done', 'description' => '', 'tags' => ['Planning'], 'attachments' => []],
                    ['id' => 1603, 'title' => 'Data mapping', 'status' => 'backlog', 'description' => '', 'tags' => ['Migration'], 'attachments' => []],
                    ['id' => 1604, 'title' => 'Test migration', 'status' => 'backlog', 'description' => '', 'tags' => ['QA'], 'attachments' => []],
                ],
                'requestLogs' => [
                    ['id' => 1651, 'text' => 'Let us pause the migration until Q4 budgeting is approved.', 'source' => 'Phone call', 'date' => '6 days ago', 'classification' => 'new', 'notes' => '', 'attachments' => []],
                ],
                'activity' => [
                    ['text' => 'Project cancelled', 'time' => '6 days ago', 'tone' => 'danger'],
                ],
            ],
        ];
    }

    /**
     * Build a generic project detail record from the board data.
     *
     * @param  array<string, mixed>  $project
     * @return array<string, mixed>
     */
    private function genericProjectDetailRecord(array $project, Team $team): array
    {
        $tasks = [];

        foreach ($project['tasks'] as $index => $task) {
            $status = $task['done'] ? 'done' : match ($project['stage']) {
                'not_started' => $index === 0 ? 'backlog' : 'todo',
                'in_progress' => 'in_progress',
                'waiting_on_client' => 'in_review',
                'in_review' => 'in_review',
                'completed' => 'done',
                'cancelled' => 'backlog',
                default => 'todo',
            };

            $tasks[] = [
                'id' => $task['id'],
                'title' => $task['title'],
                'status' => $status,
                'description' => '',
                'tags' => [],
                'attachments' => [],
            ];
        }

        $requestLogs = [];

        foreach ($project['requestLogs'] as $log) {
            $requestLogs[] = [
                'id' => $log['id'],
                'text' => $log['message'],
                'source' => 'Email',
                'date' => $log['createdAt'],
                'classification' => 'new',
                'notes' => '',
                'attachments' => [],
            ];
        }

        return [
            'description' => "Execution details for {$project['title']} inside {$team->name}.",
            'tasks' => $tasks,
            'requestLogs' => $requestLogs,
            'activity' => [
                ['text' => 'Project created', 'time' => 'Recently', 'tone' => 'muted'],
                ['text' => "Status set to {$project['stageLabel']}", 'time' => 'Recently', 'tone' => $project['tone']],
            ],
        ];
    }

    /**
     * Get the stubbed proposals page data.
     *
     * @return array<string, mixed>
     */
    public function proposals(Team $team): array
    {
        return [
            'defaultView' => 'board',
            'summary' => [
                'draftCount' => '1',
                'sentCount' => '1',
                'acceptedCount' => '1',
            ],
            'stages' => [
                ['key' => 'draft', 'label' => 'Draft', 'tone' => 'muted'],
                ['key' => 'sent', 'label' => 'Sent', 'tone' => 'accent'],
                ['key' => 'viewed', 'label' => 'Viewed', 'tone' => 'accent'],
                ['key' => 'accepted', 'label' => 'Accepted', 'tone' => 'success'],
                ['key' => 'rejected', 'label' => 'Rejected', 'tone' => 'danger'],
            ],
            'documents' => [
                [
                    'id' => 21,
                    'title' => 'Website Redesign Proposal',
                    'number' => 'P-2026-004',
                    'client' => 'Acme Corp',
                    'stage' => 'draft',
                    'stageLabel' => 'Draft',
                    'tone' => 'muted',
                    'amount' => '$5,000',
                    'amountValue' => 5000,
                    'updatedAt' => '2 days ago',
                    'dateSort' => 2,
                    'shareUrl' => 'https://biondesk.test/d/p-2026-004',
                    'items' => [
                        ['label' => 'Homepage design', 'amount' => '$2,000'],
                        ['label' => 'CMS integration', 'amount' => '$1,500'],
                        ['label' => 'Mobile responsive', 'amount' => '$1,500'],
                    ],
                ],
                [
                    'id' => 22,
                    'title' => 'Mobile App Development',
                    'number' => 'P-2026-003',
                    'client' => 'Kevin Studio',
                    'stage' => 'sent',
                    'stageLabel' => 'Sent',
                    'tone' => 'accent',
                    'amount' => '$15,000',
                    'amountValue' => 15000,
                    'updatedAt' => '4 days ago',
                    'dateSort' => 4,
                    'shareUrl' => 'https://biondesk.test/d/p-2026-003',
                    'items' => [
                        ['label' => 'iOS + Android app', 'amount' => '$12,000'],
                        ['label' => 'Backend API', 'amount' => '$3,000'],
                    ],
                ],
                [
                    'id' => 23,
                    'title' => 'Brand Identity Package',
                    'number' => 'P-2026-002',
                    'client' => 'Nexus Corp',
                    'stage' => 'viewed',
                    'stageLabel' => 'Viewed',
                    'tone' => 'accent',
                    'amount' => '$8,500',
                    'amountValue' => 8500,
                    'updatedAt' => '6 days ago',
                    'dateSort' => 6,
                    'shareUrl' => 'https://biondesk.test/d/p-2026-002',
                    'items' => [
                        ['label' => 'Logo & brand system', 'amount' => '$6,000'],
                        ['label' => 'Guideline document', 'amount' => '$2,500'],
                    ],
                ],
                [
                    'id' => 24,
                    'title' => 'E-commerce Platform',
                    'number' => 'P-2026-001',
                    'client' => 'Retail Co',
                    'stage' => 'accepted',
                    'stageLabel' => 'Accepted',
                    'tone' => 'success',
                    'amount' => '$12,000',
                    'amountValue' => 12000,
                    'updatedAt' => '10 days ago',
                    'dateSort' => 10,
                    'shareUrl' => 'https://biondesk.test/d/p-2026-001',
                    'items' => [
                        ['label' => 'Storefront build', 'amount' => '$8,000'],
                        ['label' => 'Payment integration', 'amount' => '$4,000'],
                    ],
                ],
                [
                    'id' => 25,
                    'title' => 'Legacy Migration Assessment',
                    'number' => 'P-2026-005',
                    'client' => 'Initech',
                    'stage' => 'rejected',
                    'stageLabel' => 'Rejected',
                    'tone' => 'danger',
                    'amount' => '$9,000',
                    'amountValue' => 9000,
                    'updatedAt' => '8 days ago',
                    'dateSort' => 8,
                    'shareUrl' => 'https://biondesk.test/d/p-2026-005',
                    'items' => [
                        ['label' => 'System audit', 'amount' => '$4,000'],
                        ['label' => 'Migration plan', 'amount' => '$5,000'],
                    ],
                ],
            ],
            'profileLibrarySummary' => [
                'title' => 'AI profile library ready',
                'description' => "Proposal generation will eventually personalize drafts using {$team->name}'s snippets, proof, and testimonials.",
            ],
        ];
    }

    /**
     * Get the stubbed public lead form data.
     *
     * @return array<string, mixed>
     */
    public function publicLeadForm(Team $team): array
    {
        return [
            'team' => [
                'name' => $team->name,
                'slug' => $team->slug,
            ],
            'hero' => [
                'title' => "Start a project with {$team->name}",
                'description' => 'This public lead form foundation will become the branded inquiry page for your workspace. For now it showcases the route, fallback copy, and layout that future lead capture will plug into.',
                'bannerLabel' => 'Public lead form foundation',
            ],
            'highlights' => [
                'Share one link in your bio or proposal footer.',
                'Keep inbound leads platform-agnostic from day one.',
                'Prepare the structure for later branding, Turnstile, and submission flow.',
            ],
        ];
    }
}
