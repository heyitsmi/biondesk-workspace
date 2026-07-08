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
     * Get the stubbed context needed to render the new-opportunity page.
     *
     * @return array<string, mixed>
     */
    public function opportunityCreateContext(Team $team): array
    {
        return [
            'stages' => $this->opportunities($team)['stages'],
            'contacts' => $this->contactOptions(),
            'defaults' => [
                'title' => '',
                'contactId' => '',
                'amountValue' => '',
                'stage' => 'inbox',
                'closeDate' => '',
                'priority' => 'medium',
                'description' => '',
            ],
        ];
    }

    /**
     * Get the stubbed opportunity edit page data, or null when the opportunity cannot be found.
     *
     * @return array<string, mixed>|null
     */
    public function opportunityEditContext(Team $team, int $opportunityId): ?array
    {
        $opportunity = null;

        foreach ($this->opportunities($team)['opportunities'] as $candidate) {
            if (($candidate['id'] ?? null) === $opportunityId) {
                $opportunity = $candidate;
                break;
            }
        }

        if ($opportunity === null) {
            return null;
        }

        $matchedContact = collect($this->contactOptions())
            ->first(fn ($contact) => $contact['name'] === $opportunity['company']);

        return [
            'stages' => $this->opportunities($team)['stages'],
            'contacts' => $this->contactOptions(),
            'opportunity' => [
                'id' => $opportunity['id'],
                'title' => $opportunity['title'],
                'contactId' => $matchedContact['id'] ?? '',
                'amountValue' => (string) $opportunity['amountValue'],
                'stage' => $opportunity['stage'],
                'closeDate' => '',
                'priority' => 'medium',
                'description' => $opportunity['summary'],
            ],
        ];
    }

    /**
     * @return list<array{id: int, name: string}>
     */
    private function contactOptions(): array
    {
        return array_map(
            fn (array $contact) => ['id' => $contact['id'], 'name' => $contact['company']],
            $this->contactRecords(),
        );
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
     * Get the stubbed context needed to render the new-project page.
     *
     * @return array<string, mixed>
     */
    public function projectCreateContext(Team $team): array
    {
        return [
            'stages' => $this->projects($team)['stages'],
            'clients' => $this->contactOptions(),
            'leads' => $this->projectLeadOptions(),
            'defaults' => [
                'title' => '',
                'clientId' => '',
                'stage' => 'not_started',
                'startDate' => '',
                'dueDate' => '',
                'description' => '',
                'leadId' => 1,
                'budget' => '',
            ],
        ];
    }

    /**
     * Get the stubbed project edit page data, or null when the project cannot be found.
     *
     * @return array<string, mixed>|null
     */
    public function projectEditContext(Team $team, int $projectId): ?array
    {
        $project = null;

        foreach ($this->projects($team)['projects'] as $candidate) {
            if (($candidate['id'] ?? null) === $projectId) {
                $project = $candidate;
                break;
            }
        }

        if ($project === null) {
            return null;
        }

        $detail = $this->projectDetailRecords($team)[$projectId] ?? null;
        $matchedClient = collect($this->contactOptions())
            ->first(fn ($contact) => $contact['name'] === $project['client']);

        return [
            'stages' => $this->projects($team)['stages'],
            'clients' => $this->contactOptions(),
            'leads' => $this->projectLeadOptions(),
            'project' => [
                'id' => $project['id'],
                'title' => $project['title'],
                'clientId' => $matchedClient['id'] ?? '',
                'stage' => $project['stage'],
                'startDate' => '',
                'dueDate' => '',
                'description' => $detail['description'] ?? '',
                'leadId' => 1,
                'budget' => (string) preg_replace('/[^0-9.]/', '', $project['budget']),
            ],
        ];
    }

    /**
     * @return list<array{id: int, name: string}>
     */
    private function projectLeadOptions(): array
    {
        return [
            ['id' => 1, 'name' => 'You'],
            ['id' => 2, 'name' => 'Jamie Chen'],
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
     * Get the stubbed invoices page data.
     *
     * @return array<string, mixed>
     */
    public function invoices(Team $team): array
    {
        return [
            'invoices' => [
                [
                    'id' => 42,
                    'number' => 'INV-2023-042',
                    'client' => 'Acme Corp',
                    'context' => 'Website Redesign (Milestone 1)',
                    'status' => 'draft',
                    'statusLabel' => 'Draft',
                    'tone' => 'muted',
                    'issuedAt' => '-',
                    'issuedSort' => 0,
                    'dueAt' => 'Nov 15, 2023',
                    'dueSort' => 20231115,
                    'amount' => '$2,500.00',
                    'amountValue' => 2500,
                ],
                [
                    'id' => 41,
                    'number' => 'INV-2023-041',
                    'client' => 'Globex Inc',
                    'context' => 'Q3 Marketing Campaign',
                    'status' => 'sent',
                    'statusLabel' => 'Sent',
                    'tone' => 'accent',
                    'issuedAt' => 'Oct 10, 2023',
                    'issuedSort' => 20231010,
                    'dueAt' => 'Oct 24, 2023',
                    'dueSort' => 20231024,
                    'amount' => '$1,200.00',
                    'amountValue' => 1200,
                ],
                [
                    'id' => 40,
                    'number' => 'INV-2023-040',
                    'client' => 'Stark Industries',
                    'context' => 'SEO Audit',
                    'status' => 'paid',
                    'statusLabel' => 'Paid',
                    'tone' => 'success',
                    'issuedAt' => 'Oct 01, 2023',
                    'issuedSort' => 20231001,
                    'dueAt' => 'Oct 15, 2023',
                    'dueSort' => 20231015,
                    'amount' => '$800.00',
                    'amountValue' => 800,
                ],
                [
                    'id' => 39,
                    'number' => 'INV-2023-039',
                    'client' => 'Wayne Enterprises',
                    'context' => 'App Wireframing',
                    'status' => 'overdue',
                    'statusLabel' => 'Overdue',
                    'tone' => 'danger',
                    'issuedAt' => 'Sep 15, 2023',
                    'issuedSort' => 20230915,
                    'dueAt' => 'Sep 30, 2023',
                    'dueSort' => 20230930,
                    'amount' => '$3,400.00',
                    'amountValue' => 3400,
                ],
            ],
        ];
    }

    /**
     * Get the stubbed invoice detail page data, or null when the invoice cannot be found.
     *
     * @return array<string, mixed>|null
     */
    public function invoiceDetail(Team $team, int $invoiceId): ?array
    {
        $invoice = null;

        foreach ($this->invoices($team)['invoices'] as $candidate) {
            if (($candidate['id'] ?? null) === $invoiceId) {
                $invoice = $candidate;
                break;
            }
        }

        $detail = $this->invoiceDetailRecords()[$invoiceId] ?? null;

        if ($invoice === null || $detail === null) {
            return null;
        }

        return [
            'invoice' => array_merge($invoice, $detail, [
                'business' => [
                    'name' => 'Biondesk Studio',
                    'address' => "123 Creative Street, Tech District\nJakarta, Indonesia 12345",
                    'email' => 'hello@biondesk.com',
                ],
            ]),
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function invoiceDetailRecords(): array
    {
        $paymentInstructions = "Please transfer the amount due to the following bank account:\n".
            "Bank: TechBank International\n".
            "Account Name: Biondesk Studio\n".
            "Account Number: 1234-5678-9012\n".
            "SWIFT: TECHIDJA\n\n".
            'Or pay via Stripe: https://stripe.com/pay/biondesk';

        return [
            42 => [
                'dueInLabel' => 'Due in 14 days',
                'billTo' => [
                    'name' => 'Acme Corp',
                    'attn' => 'John Doe',
                    'address' => "456 Enterprise Blvd, Suite 200\nSan Francisco, CA 94103",
                    'email' => 'john.doe@acmecorp.com',
                ],
                'lineItems' => [
                    ['name' => 'Website Redesign - Phase 1', 'description' => 'UI/UX prototyping for Home, About, and Services pages. Includes 2 rounds of revisions.', 'qty' => 1, 'price' => '$2,000.00', 'total' => '$2,000.00'],
                    ['name' => 'SEO Audit', 'description' => 'Comprehensive technical and on-page SEO audit of the current platform.', 'qty' => 1, 'price' => '$500.00', 'total' => '$500.00'],
                ],
                'subtotal' => '$2,500.00',
                'taxLabel' => 'Tax (0%)',
                'taxAmount' => '$0.00',
                'total' => '$2,500.00',
                'amountPaid' => '$0.00',
                'amountDue' => '$2,500.00',
                'paymentInstructions' => $paymentInstructions,
                'payments' => [],
                'linkedProject' => null,
                'currency' => 'USD',
            ],
            41 => [
                'dueInLabel' => 'Due in 14 days',
                'billTo' => [
                    'name' => 'Globex Inc',
                    'attn' => 'Hank Scorpio',
                    'address' => "1 Globex Plaza\nCypress Creek, FL 33428",
                    'email' => 'hank@globex.com',
                ],
                'lineItems' => [
                    ['name' => 'Q3 Marketing Campaign', 'description' => 'Paid social and search campaign management for Q3, including creative production.', 'qty' => 1, 'price' => '$1,200.00', 'total' => '$1,200.00'],
                ],
                'subtotal' => '$1,200.00',
                'taxLabel' => 'Tax (0%)',
                'taxAmount' => '$0.00',
                'total' => '$1,200.00',
                'amountPaid' => '$0.00',
                'amountDue' => '$1,200.00',
                'paymentInstructions' => $paymentInstructions,
                'payments' => [],
                'linkedProject' => ['id' => 14, 'title' => 'API Integration Layer'],
                'currency' => 'USD',
            ],
            40 => [
                'dueInLabel' => 'Paid in full',
                'billTo' => [
                    'name' => 'Stark Industries',
                    'attn' => 'Pepper Potts',
                    'address' => "200 Park Avenue\nNew York, NY 10166",
                    'email' => 'pepper@stark.com',
                ],
                'lineItems' => [
                    ['name' => 'SEO Audit', 'description' => 'Technical SEO audit and recommendations report.', 'qty' => 1, 'price' => '$800.00', 'total' => '$800.00'],
                ],
                'subtotal' => '$800.00',
                'taxLabel' => 'Tax (0%)',
                'taxAmount' => '$0.00',
                'total' => '$800.00',
                'amountPaid' => '$800.00',
                'amountDue' => '$0.00',
                'paymentInstructions' => $paymentInstructions,
                'payments' => [
                    ['id' => 1, 'label' => 'Bank Transfer', 'amount' => '$800.00', 'recordedAt' => 'Oct 12, 2023'],
                ],
                'linkedProject' => null,
                'currency' => 'USD',
            ],
            39 => [
                'dueInLabel' => '9 days overdue',
                'billTo' => [
                    'name' => 'Wayne Enterprises',
                    'attn' => 'Lucius Fox',
                    'address' => "1007 Mountain Drive\nGotham, NJ 07001",
                    'email' => 'lucius@wayne.com',
                ],
                'lineItems' => [
                    ['name' => 'App Wireframing', 'description' => 'Low and high fidelity wireframes for the mobile companion app.', 'qty' => 1, 'price' => '$3,400.00', 'total' => '$3,400.00'],
                ],
                'subtotal' => '$3,400.00',
                'taxLabel' => 'Tax (0%)',
                'taxAmount' => '$0.00',
                'total' => '$3,400.00',
                'amountPaid' => '$0.00',
                'amountDue' => '$3,400.00',
                'paymentInstructions' => $paymentInstructions,
                'payments' => [],
                'linkedProject' => ['id' => 15, 'title' => 'Marketing Site'],
                'currency' => 'USD',
            ],
        ];
    }

    /**
     * Get the stubbed context needed to render the new-invoice page.
     *
     * @return array<string, mixed>
     */
    public function invoiceCreateContext(Team $team): array
    {
        return [
            'nextNumber' => 'INV-2023-043',
            'defaultIssuedAt' => now()->toDateString(),
            'defaultDueAt' => now()->addDays(14)->toDateString(),
            'clients' => [
                ['id' => 1, 'name' => 'Acme Corp'],
                ['id' => 2, 'name' => 'Globex Inc'],
                ['id' => 3, 'name' => 'Stark Industries'],
                ['id' => 4, 'name' => 'Wayne Enterprises'],
            ],
            'projects' => [
                ['id' => 11, 'title' => 'Portfolio Redesign'],
                ['id' => 12, 'title' => 'Fintech Brand Identity'],
                ['id' => 13, 'title' => 'E-commerce Backend'],
                ['id' => 14, 'title' => 'API Integration Layer'],
                ['id' => 15, 'title' => 'Marketing Site'],
                ['id' => 16, 'title' => 'Legacy System Migration'],
            ],
        ];
    }

    /**
     * Get the stubbed quotations page data.
     *
     * @return array<string, mixed>
     */
    public function quotations(Team $team): array
    {
        return [
            'quotations' => [
                [
                    'id' => 14,
                    'number' => 'QUO-2023-014',
                    'client' => 'Acme Corp',
                    'context' => 'Website Redesign',
                    'status' => 'draft',
                    'statusLabel' => 'Draft',
                    'tone' => 'muted',
                    'issuedAt' => '-',
                    'issuedSort' => 0,
                    'expiryAt' => 'Nov 15, 2023',
                    'expirySort' => 20231115,
                    'amount' => '$2,500.00',
                    'amountValue' => 2500,
                ],
                [
                    'id' => 13,
                    'number' => 'QUO-2023-013',
                    'client' => 'Globex Inc',
                    'context' => 'Q3 Marketing Campaign',
                    'status' => 'pending',
                    'statusLabel' => 'Pending',
                    'tone' => 'accent',
                    'issuedAt' => 'Oct 10, 2023',
                    'issuedSort' => 20231010,
                    'expiryAt' => 'Oct 24, 2023',
                    'expirySort' => 20231024,
                    'amount' => '$1,200.00',
                    'amountValue' => 1200,
                ],
                [
                    'id' => 12,
                    'number' => 'QUO-2023-012',
                    'client' => 'Stark Industries',
                    'context' => 'SEO Audit',
                    'status' => 'accepted',
                    'statusLabel' => 'Accepted',
                    'tone' => 'success',
                    'issuedAt' => 'Oct 01, 2023',
                    'issuedSort' => 20231001,
                    'expiryAt' => 'Oct 15, 2023',
                    'expirySort' => 20231015,
                    'amount' => '$800.00',
                    'amountValue' => 800,
                ],
                [
                    'id' => 11,
                    'number' => 'QUO-2023-011',
                    'client' => 'Wayne Enterprises',
                    'context' => 'App Wireframing',
                    'status' => 'declined',
                    'statusLabel' => 'Declined',
                    'tone' => 'danger',
                    'issuedAt' => 'Sep 15, 2023',
                    'issuedSort' => 20230915,
                    'expiryAt' => 'Sep 30, 2023',
                    'expirySort' => 20230930,
                    'amount' => '$3,400.00',
                    'amountValue' => 3400,
                ],
            ],
        ];
    }

    /**
     * Get the stubbed quotation detail page data, or null when the quotation cannot be found.
     *
     * @return array<string, mixed>|null
     */
    public function quotationDetail(Team $team, int $quotationId): ?array
    {
        $quotation = null;

        foreach ($this->quotations($team)['quotations'] as $candidate) {
            if (($candidate['id'] ?? null) === $quotationId) {
                $quotation = $candidate;
                break;
            }
        }

        $detail = $this->quotationDetailRecords()[$quotationId] ?? null;

        if ($quotation === null || $detail === null) {
            return null;
        }

        return [
            'quotation' => array_merge($quotation, $detail, [
                'business' => [
                    'name' => 'Biondesk Studio',
                    'address' => "123 Creative Street, Tech District\nJakarta, Indonesia 12345",
                    'email' => 'hello@biondesk.com',
                ],
            ]),
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function quotationDetailRecords(): array
    {
        $terms = "This is a quotation on the goods or services named, subject to the conditions noted below:\n".
            "1. Prices are valid for 14 days from the date of quotation.\n".
            "2. 50% deposit required upon acceptance to begin work.\n".
            '3. This is not an invoice. An official invoice will be sent after the quotation is accepted.';

        return [
            14 => [
                'validityLabel' => 'Valid for 14 days',
                'preparedFor' => [
                    'name' => 'Acme Corp',
                    'attn' => 'John Doe',
                    'address' => "456 Enterprise Blvd, Suite 200\nSan Francisco, CA 94103",
                    'email' => 'john.doe@acmecorp.com',
                ],
                'lineItems' => [
                    ['name' => 'Website Redesign - Phase 1', 'description' => 'UI/UX prototyping for Home, About, and Services pages. Includes 2 rounds of revisions.', 'qty' => 1, 'price' => '$2,000.00', 'total' => '$2,000.00'],
                    ['name' => 'SEO Audit', 'description' => 'Comprehensive technical and on-page SEO audit of the current platform.', 'qty' => 1, 'price' => '$500.00', 'total' => '$500.00'],
                ],
                'subtotal' => '$2,500.00',
                'discountLabel' => 'Discount (0%)',
                'discountAmount' => '$0.00',
                'total' => '$2,500.00',
                'terms' => $terms,
                'linkedProject' => null,
                'currency' => 'USD',
            ],
            13 => [
                'validityLabel' => 'Valid for 14 days (Expires Oct 24, 2023)',
                'preparedFor' => [
                    'name' => 'Globex Inc',
                    'attn' => 'Sarah Connor',
                    'address' => "789 Innovation Drive\nAustin, TX 78701",
                    'email' => 'sarah.connor@globex.com',
                ],
                'lineItems' => [
                    ['name' => 'Q3 Marketing Campaign', 'description' => 'Setup and management of digital ad campaigns across social media channels for Q3.', 'qty' => 1, 'price' => '$1,000.00', 'total' => '$1,000.00'],
                    ['name' => 'Ad Creatives', 'description' => 'Set of 5 custom ad graphics and copywriting.', 'qty' => 1, 'price' => '$200.00', 'total' => '$200.00'],
                ],
                'subtotal' => '$1,200.00',
                'discountLabel' => 'Discount (0%)',
                'discountAmount' => '$0.00',
                'total' => '$1,200.00',
                'terms' => $terms,
                'linkedProject' => ['id' => 14, 'title' => 'API Integration Layer'],
                'currency' => 'USD',
            ],
            12 => [
                'validityLabel' => 'Accepted on Oct 05, 2023',
                'preparedFor' => [
                    'name' => 'Stark Industries',
                    'attn' => 'Pepper Potts',
                    'address' => "200 Park Avenue\nNew York, NY 10166",
                    'email' => 'pepper@stark.com',
                ],
                'lineItems' => [
                    ['name' => 'SEO Audit', 'description' => 'Technical SEO audit and recommendations report.', 'qty' => 1, 'price' => '$800.00', 'total' => '$800.00'],
                ],
                'subtotal' => '$800.00',
                'discountLabel' => 'Discount (0%)',
                'discountAmount' => '$0.00',
                'total' => '$800.00',
                'terms' => $terms,
                'linkedProject' => null,
                'currency' => 'USD',
            ],
            11 => [
                'validityLabel' => 'Expired Sep 30, 2023',
                'preparedFor' => [
                    'name' => 'Wayne Enterprises',
                    'attn' => 'Lucius Fox',
                    'address' => "1007 Mountain Drive\nGotham, NJ 07001",
                    'email' => 'lucius@wayne.com',
                ],
                'lineItems' => [
                    ['name' => 'App Wireframing', 'description' => 'Low and high fidelity wireframes for the mobile companion app.', 'qty' => 1, 'price' => '$3,400.00', 'total' => '$3,400.00'],
                ],
                'subtotal' => '$3,400.00',
                'discountLabel' => 'Discount (0%)',
                'discountAmount' => '$0.00',
                'total' => '$3,400.00',
                'terms' => $terms,
                'linkedProject' => ['id' => 15, 'title' => 'Marketing Site'],
                'currency' => 'USD',
            ],
        ];
    }

    /**
     * Get the stubbed context needed to render the new-quotation page.
     *
     * @return array<string, mixed>
     */
    public function quotationCreateContext(Team $team): array
    {
        return [
            'nextNumber' => 'QUO-2023-015',
            'defaultIssuedAt' => now()->toDateString(),
            'defaultExpiryAt' => now()->addDays(14)->toDateString(),
            'clients' => [
                ['id' => 1, 'name' => 'Acme Corp'],
                ['id' => 2, 'name' => 'Globex Inc'],
                ['id' => 3, 'name' => 'Stark Industries'],
                ['id' => 4, 'name' => 'Wayne Enterprises'],
            ],
            'projects' => [
                ['id' => 11, 'title' => 'Portfolio Redesign'],
                ['id' => 12, 'title' => 'Fintech Brand Identity'],
                ['id' => 13, 'title' => 'E-commerce Backend'],
                ['id' => 14, 'title' => 'API Integration Layer'],
                ['id' => 15, 'title' => 'Marketing Site'],
                ['id' => 16, 'title' => 'Legacy System Migration'],
            ],
        ];
    }

    /**
     * Get the stubbed contacts page data.
     *
     * @return array<string, mixed>
     */
    public function contacts(Team $team): array
    {
        return [
            'contacts' => $this->contactRecords(),
            'contactsCount' => (string) count($this->contactRecords()),
            'defaultFilters' => [
                'search' => '',
                'type' => '',
            ],
        ];
    }

    /**
     * Get the stubbed context needed to render the new-contact page.
     *
     * @return array<string, mixed>
     */
    public function contactCreateContext(Team $team): array
    {
        return [
            'contactsCount' => (string) count($this->contactRecords()),
            'defaults' => [
                'type' => 'client',
                'company' => '',
                'firstName' => '',
                'lastName' => '',
                'email' => '',
                'phone' => '',
                'role' => '',
                'location' => '',
                'website' => '',
                'notes' => '',
            ],
        ];
    }

    /**
     * Get the stubbed contact detail page data, or null when the contact cannot be found.
     *
     * @return array<string, mixed>|null
     */
    public function contactDetail(Team $team, int $contactId): ?array
    {
        $contact = null;

        foreach ($this->contactRecords() as $candidate) {
            if (($candidate['id'] ?? null) === $contactId) {
                $contact = $candidate;
                break;
            }
        }

        $detail = $this->contactDetailRecords($team)[$contactId] ?? null;

        if ($contact === null || $detail === null) {
            return null;
        }

        return [
            'contactsCount' => (string) count($this->contactRecords()),
            'contact' => array_merge($contact, $detail),
        ];
    }

    /**
     * Get the stubbed context needed to render the edit-contact page.
     *
     * @return array<string, mixed>|null
     */
    public function contactEditContext(Team $team, int $contactId): ?array
    {
        return $this->contactDetail($team, $contactId);
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function contactRecords(): array
    {
        return [
            [
                'id' => 124,
                'code' => 'CNT-00124',
                'fullName' => 'John Smith',
                'firstName' => 'John',
                'lastName' => 'Smith',
                'initials' => 'JS',
                'company' => 'Acme Corp',
                'email' => 'john@acmecorp.com',
                'phone' => '+1 (555) 123-4567',
                'type' => 'client',
                'typeLabel' => 'Client',
                'typeTone' => 'accent',
                'status' => 'active',
                'statusLabel' => 'Active',
                'statusTone' => 'success',
            ],
            [
                'id' => 125,
                'code' => 'CNT-00125',
                'fullName' => 'Alice Doe',
                'firstName' => 'Alice',
                'lastName' => 'Doe',
                'initials' => 'AD',
                'company' => 'Globex Inc',
                'email' => 'alice@globex.inc',
                'phone' => '+1 (555) 987-6543',
                'type' => 'lead',
                'typeLabel' => 'Lead',
                'typeTone' => 'muted',
                'status' => 'prospect',
                'statusLabel' => 'Prospect',
                'statusTone' => 'accent',
            ],
            [
                'id' => 126,
                'code' => 'CNT-00126',
                'fullName' => 'Marcus Tan',
                'firstName' => 'Marcus',
                'lastName' => 'Tan',
                'initials' => 'MT',
                'company' => 'Northstar Capital',
                'email' => 'marcus@northstar.cap',
                'phone' => '+1 (555) 381-2910',
                'type' => 'client',
                'typeLabel' => 'Client',
                'typeTone' => 'accent',
                'status' => 'active',
                'statusLabel' => 'Active',
                'statusTone' => 'success',
            ],
            [
                'id' => 127,
                'code' => 'CNT-00127',
                'fullName' => 'Nina Vega',
                'firstName' => 'Nina',
                'lastName' => 'Vega',
                'initials' => 'NV',
                'company' => 'Pixel Marsh',
                'email' => 'nina@pixelmarsh.co',
                'phone' => '+1 (555) 220-1113',
                'type' => 'vendor',
                'typeLabel' => 'Vendor',
                'typeTone' => 'muted',
                'status' => 'active',
                'statusLabel' => 'Active',
                'statusTone' => 'success',
            ],
            [
                'id' => 128,
                'code' => 'CNT-00128',
                'fullName' => 'Omar Vega',
                'firstName' => 'Omar',
                'lastName' => 'Vega',
                'initials' => 'OV',
                'company' => 'Initech',
                'email' => 'omar@initech.com',
                'phone' => '+1 (555) 700-4433',
                'type' => 'lead',
                'typeLabel' => 'Lead',
                'typeTone' => 'muted',
                'status' => 'inactive',
                'statusLabel' => 'Inactive',
                'statusTone' => 'danger',
            ],
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function contactDetailRecords(Team $team): array
    {
        return [
            124 => [
                'role' => 'Marketing Director',
                'location' => 'New York, United States',
                'website' => 'https://acmecorp.com',
                'notes' => "Primary point of contact for redesign and invoice approvals.\nPrefers concise updates and email summaries after meetings.",
                'billingAddress' => "123 Corporate Blvd, Suite 200\nNew York, NY 10001\nUnited States",
                'relatedProjects' => [
                    ['id' => 11, 'title' => 'Portfolio Redesign', 'stageLabel' => 'Not Started', 'tone' => 'muted', 'dueAt' => 'Jul 28'],
                    ['id' => 15, 'title' => 'Marketing Site', 'stageLabel' => 'Completed', 'tone' => 'success', 'dueAt' => 'Jul 14'],
                ],
                'relatedInvoices' => [
                    ['id' => 42, 'number' => 'INV-2023-042', 'amount' => '$2,500.00', 'statusLabel' => 'Draft', 'tone' => 'muted', 'dueAt' => 'Nov 15, 2023'],
                    ['id' => 39, 'number' => 'INV-2023-039', 'amount' => '$3,400.00', 'statusLabel' => 'Overdue', 'tone' => 'danger', 'dueAt' => 'Sep 30, 2023'],
                ],
                'notesAndFiles' => [
                    ['id' => 1, 'label' => 'Kickoff preferences', 'kind' => 'note', 'meta' => 'Updated 2 days ago'],
                    ['id' => 2, 'label' => 'Brand brief.pdf', 'kind' => 'file', 'meta' => 'Uploaded last week'],
                    ['id' => 3, 'label' => 'Invoice requirements', 'kind' => 'note', 'meta' => 'Added yesterday'],
                ],
                'activity' => [
                    ['id' => 1, 'title' => 'Invoice INV-2023-045 was paid.', 'description' => 'Payment confirmed and logged for the latest milestone.', 'when' => 'Oct 24, 2023 at 2:30 PM', 'tone' => 'success'],
                    ['id' => 2, 'title' => 'Proposal follow-up email sent.', 'description' => "Shared next steps and timeline options with {$team->name}.", 'when' => 'Oct 21, 2023 at 9:00 AM', 'tone' => 'accent'],
                    ['id' => 3, 'title' => 'Contact updated.', 'description' => 'Phone number and role were refreshed from the latest client call.', 'when' => 'Oct 18, 2023 at 4:45 PM', 'tone' => 'muted'],
                ],
            ],
            125 => [
                'role' => 'Operations Lead',
                'location' => 'Austin, United States',
                'website' => 'https://globex.inc',
                'notes' => 'Warm inbound lead from referral network. Discovery call scheduled next Tuesday.',
                'billingAddress' => "500 Innovation Way\nAustin, TX 78701\nUnited States",
                'relatedProjects' => [],
                'relatedInvoices' => [],
                'notesAndFiles' => [
                    ['id' => 4, 'label' => 'Discovery notes', 'kind' => 'note', 'meta' => 'Created today'],
                ],
                'activity' => [
                    ['id' => 4, 'title' => 'Lead added to contacts.', 'description' => 'Created from opportunity pipeline to centralize follow-up.', 'when' => 'Today at 8:15 AM', 'tone' => 'accent'],
                ],
            ],
            126 => [
                'role' => 'Co-founder',
                'location' => 'Singapore',
                'website' => 'https://northstar.cap',
                'notes' => 'High-trust client with fast turnaround on approvals.',
                'billingAddress' => "12 Robinson Road\nSingapore 048545",
                'relatedProjects' => [
                    ['id' => 12, 'title' => 'Fintech Brand Identity', 'stageLabel' => 'In Progress', 'tone' => 'accent', 'dueAt' => 'Jul 20'],
                ],
                'relatedInvoices' => [
                    ['id' => 41, 'number' => 'INV-2023-041', 'amount' => '$1,200.00', 'statusLabel' => 'Sent', 'tone' => 'accent', 'dueAt' => 'Oct 24, 2023'],
                ],
                'notesAndFiles' => [
                    ['id' => 5, 'label' => 'Brand references', 'kind' => 'file', 'meta' => 'Uploaded 3 days ago'],
                ],
                'activity' => [
                    ['id' => 5, 'title' => 'Proposal accepted.', 'description' => 'Scope approved and ready for next billing step.', 'when' => 'Yesterday at 1:10 PM', 'tone' => 'success'],
                ],
            ],
            127 => [
                'role' => 'Production Partner',
                'location' => 'Bandung, Indonesia',
                'website' => 'https://pixelmarsh.co',
                'notes' => 'Vendor contact for motion assets and export support.',
                'billingAddress' => "Jalan Braga 45\nBandung 40111\nIndonesia",
                'relatedProjects' => [],
                'relatedInvoices' => [],
                'notesAndFiles' => [
                    ['id' => 6, 'label' => 'Vendor agreement', 'kind' => 'file', 'meta' => 'Uploaded 2 weeks ago'],
                ],
                'activity' => [
                    ['id' => 6, 'title' => 'Vendor profile verified.', 'description' => 'Scope and preferred payment terms reviewed.', 'when' => 'Last week', 'tone' => 'muted'],
                ],
            ],
            128 => [
                'role' => 'IT Manager',
                'location' => 'Dallas, United States',
                'website' => 'https://initech.com',
                'notes' => 'Old lead that paused procurement this quarter.',
                'billingAddress' => "410 Commerce Street\nDallas, TX 75201\nUnited States",
                'relatedProjects' => [],
                'relatedInvoices' => [],
                'notesAndFiles' => [
                    ['id' => 7, 'label' => 'Migration summary', 'kind' => 'note', 'meta' => 'Archived 8 days ago'],
                ],
                'activity' => [
                    ['id' => 7, 'title' => 'Lead marked inactive.', 'description' => 'Pipeline closed after budget freeze update.', 'when' => '8 days ago', 'tone' => 'danger'],
                ],
            ],
        ];
    }

    /**
     * Get the stubbed context needed to render the new-proposal page.
     *
     * @return array<string, mixed>
     */
    public function proposalCreateContext(Team $team): array
    {
        return [
            'nextNumber' => 'P-2026-006',
            'defaultDatePrepared' => now()->toDateString(),
            'defaultValidUntil' => now()->addDays(14)->toDateString(),
            'clients' => $this->contactOptions(),
            'projects' => [
                ['id' => 11, 'title' => 'Portfolio Redesign'],
                ['id' => 12, 'title' => 'Fintech Brand Identity'],
                ['id' => 13, 'title' => 'E-commerce Backend'],
                ['id' => 14, 'title' => 'API Integration Layer'],
                ['id' => 15, 'title' => 'Marketing Site'],
                ['id' => 16, 'title' => 'Legacy System Migration'],
            ],
        ];
    }

    /**
     * Get the stubbed proposal edit page data, or null when the proposal cannot be found.
     *
     * @return array<string, mixed>|null
     */
    public function proposalEditContext(Team $team, int $proposalId): ?array
    {
        $proposal = null;

        foreach ($this->proposals($team)['documents'] as $candidate) {
            if (($candidate['id'] ?? null) === $proposalId) {
                $proposal = $candidate;
                break;
            }
        }

        if ($proposal === null) {
            return null;
        }

        $matchedClient = collect($this->contactOptions())
            ->first(fn ($contact) => $contact['name'] === $proposal['client']);

        return [
            'clients' => $this->contactOptions(),
            'projects' => [
                ['id' => 11, 'title' => 'Portfolio Redesign'],
                ['id' => 12, 'title' => 'Fintech Brand Identity'],
                ['id' => 13, 'title' => 'E-commerce Backend'],
                ['id' => 14, 'title' => 'API Integration Layer'],
                ['id' => 15, 'title' => 'Marketing Site'],
                ['id' => 16, 'title' => 'Legacy System Migration'],
            ],
            'proposal' => [
                'id' => $proposal['id'],
                'title' => $proposal['title'],
                'number' => $proposal['number'],
                'clientId' => $matchedClient['id'] ?? '',
                'datePrepared' => now()->toDateString(),
                'validUntil' => now()->addDays(14)->toDateString(),
                'content' => '',
                'lineItems' => array_map(
                    fn (array $item) => [
                        'name' => $item['label'],
                        'description' => '',
                        'qty' => 1,
                        'price' => ltrim($item['amount'], '$'),
                    ],
                    $proposal['items'],
                ),
                'notes' => '',
            ],
        ];
    }

    /**
     * Get the stubbed proposal detail (document) page data, or null when the proposal cannot be found.
     *
     * @return array<string, mixed>|null
     */
    public function proposalDetail(Team $team, int $proposalId): ?array
    {
        $proposal = null;

        foreach ($this->proposals($team)['documents'] as $candidate) {
            if (($candidate['id'] ?? null) === $proposalId) {
                $proposal = $candidate;
                break;
            }
        }

        $detail = $this->proposalDetailRecords()[$proposalId] ?? null;

        if ($proposal === null || $detail === null) {
            return null;
        }

        return [
            'proposal' => array_merge($proposal, $detail, [
                'business' => [
                    'name' => 'Biondesk Studio',
                    'address' => "123 Creative Street, Tech District\nJakarta, Indonesia 12345",
                    'email' => 'hello@biondesk.com',
                ],
            ]),
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function proposalDetailRecords(): array
    {
        return [
            21 => [
                'datePrepared' => 'Oct 24, 2023',
                'datePreparedIso' => '2023-10-24',
                'validUntil' => 'Nov 24, 2023',
                'validUntilIso' => '2023-11-24',
                'preparedFor' => [
                    'name' => 'Acme Corp',
                    'attn' => 'John Doe',
                    'address' => "456 Enterprise Blvd, Suite 200\nSan Francisco, CA 94103",
                    'email' => 'john.doe@acmecorp.com',
                ],
                'summary' => 'Thank you for the opportunity to propose a website redesign for Acme Corp. Based on our discussion, the new website will focus on modernizing your brand presence, improving conversion rates, and ensuring a seamless experience across all devices.',
                'scopeIntro' => 'We will deliver the following:',
                'scopeItems' => [
                    'UI/UX design for 5 core pages (Home, About, Services, Case Studies, Contact)',
                    'Responsive frontend development using React and Tailwind CSS',
                    'Integration with your existing headless CMS',
                    'Basic on-page SEO setup',
                ],
                'timeline' => 'The estimated time for completion is 4-6 weeks from the date of project commencement, assuming timely feedback and content delivery from your team.',
                'lineItems' => [
                    ['name' => 'Homepage design', 'description' => 'Figma prototypes for desktop and mobile layouts.', 'qty' => 1, 'price' => '$2,000.00', 'total' => '$2,000.00'],
                    ['name' => 'CMS integration', 'description' => 'Integration with your existing headless CMS.', 'qty' => 1, 'price' => '$1,500.00', 'total' => '$1,500.00'],
                    ['name' => 'Mobile responsive', 'description' => 'Responsive frontend polish across breakpoints.', 'qty' => 1, 'price' => '$1,500.00', 'total' => '$1,500.00'],
                ],
                'subtotal' => '$5,000.00',
                'taxLabel' => 'Tax (0%)',
                'taxAmount' => '$0.00',
                'total' => '$5,000.00',
                'notes' => 'This proposal is valid until the date above. Please reach out if you would like to discuss scope or pricing before accepting.',
                'linkedProject' => null,
                'currency' => 'USD',
            ],
            22 => [
                'datePrepared' => 'Oct 22, 2023',
                'datePreparedIso' => '2023-10-22',
                'validUntil' => 'Nov 22, 2023',
                'validUntilIso' => '2023-11-22',
                'preparedFor' => [
                    'name' => 'Kevin Studio',
                    'attn' => 'Kevin Nguyen',
                    'address' => "88 Studio Lane\nAustin, TX 78701",
                    'email' => 'kevin@kevinstudio.com',
                ],
                'summary' => 'Thank you for considering us to build the MVP for your mobile app. This proposal outlines the scope, timeline, and investment required to take your product from concept to a working release on iOS and Android.',
                'scopeIntro' => 'We will deliver the following:',
                'scopeItems' => [
                    'Native-quality cross-platform app for iOS and Android',
                    'Backend API with authentication and data storage',
                    'App store submission support for both platforms',
                ],
                'timeline' => 'The estimated time for completion is 8-10 weeks from the date of project commencement.',
                'lineItems' => [
                    ['name' => 'iOS + Android app', 'description' => 'Cross-platform mobile app covering the core MVP flows.', 'qty' => 1, 'price' => '$12,000.00', 'total' => '$12,000.00'],
                    ['name' => 'Backend API', 'description' => 'API, authentication, and data storage for the app.', 'qty' => 1, 'price' => '$3,000.00', 'total' => '$3,000.00'],
                ],
                'subtotal' => '$15,000.00',
                'taxLabel' => 'Tax (0%)',
                'taxAmount' => '$0.00',
                'total' => '$15,000.00',
                'notes' => 'This proposal is valid until the date above. Please reach out if you would like to discuss scope or pricing before accepting.',
                'linkedProject' => null,
                'currency' => 'USD',
            ],
            23 => [
                'datePrepared' => 'Oct 18, 2023',
                'datePreparedIso' => '2023-10-18',
                'validUntil' => 'Nov 18, 2023',
                'validUntilIso' => '2023-11-18',
                'preparedFor' => [
                    'name' => 'Nexus Corp',
                    'attn' => 'Eli Ward',
                    'address' => "77 Fintech Row, Suite 400\nSan Francisco, CA 94105",
                    'email' => 'eli.ward@nexuscorp.com',
                ],
                'summary' => 'This proposal covers a full brand identity package for Nexus Corp, designed to give your fintech product a distinctive, trustworthy visual language across every customer touchpoint.',
                'scopeIntro' => 'We will deliver the following:',
                'scopeItems' => [
                    'Logo design and full brand system (color, type, iconography)',
                    'Brand guideline document for internal and partner use',
                ],
                'timeline' => 'The estimated time for completion is 3-4 weeks from the date of project commencement.',
                'lineItems' => [
                    ['name' => 'Logo & brand system', 'description' => 'Primary logo, color palette, typography, and iconography.', 'qty' => 1, 'price' => '$6,000.00', 'total' => '$6,000.00'],
                    ['name' => 'Guideline document', 'description' => 'Brand guideline document covering usage across channels.', 'qty' => 1, 'price' => '$2,500.00', 'total' => '$2,500.00'],
                ],
                'subtotal' => '$8,500.00',
                'taxLabel' => 'Tax (0%)',
                'taxAmount' => '$0.00',
                'total' => '$8,500.00',
                'notes' => 'This proposal is valid until the date above. Please reach out if you would like to discuss scope or pricing before accepting.',
                'linkedProject' => null,
                'currency' => 'USD',
            ],
            24 => [
                'datePrepared' => 'Oct 12, 2023',
                'datePreparedIso' => '2023-10-12',
                'validUntil' => 'Nov 12, 2023',
                'validUntilIso' => '2023-11-12',
                'preparedFor' => [
                    'name' => 'Retail Co',
                    'attn' => 'Jules Harmon',
                    'address' => "12 Commerce Plaza\nChicago, IL 60601",
                    'email' => 'jules.harmon@retailco.com',
                ],
                'summary' => 'This proposal outlines the build of a complete e-commerce platform for Retail Co, covering storefront, checkout, and payment processing.',
                'scopeIntro' => 'We will deliver the following:',
                'scopeItems' => [
                    'Storefront build with product catalog and search',
                    'Checkout flow with payment gateway integration',
                ],
                'timeline' => 'The estimated time for completion is 6-8 weeks from the date of project commencement.',
                'lineItems' => [
                    ['name' => 'Storefront build', 'description' => 'Product catalog, search, and storefront pages.', 'qty' => 1, 'price' => '$8,000.00', 'total' => '$8,000.00'],
                    ['name' => 'Payment integration', 'description' => 'Checkout flow with payment gateway integration.', 'qty' => 1, 'price' => '$4,000.00', 'total' => '$4,000.00'],
                ],
                'subtotal' => '$12,000.00',
                'taxLabel' => 'Tax (0%)',
                'taxAmount' => '$0.00',
                'total' => '$12,000.00',
                'notes' => 'This proposal is valid until the date above. Please reach out if you would like to discuss scope or pricing before accepting.',
                'linkedProject' => null,
                'currency' => 'USD',
            ],
            25 => [
                'datePrepared' => 'Oct 08, 2023',
                'datePreparedIso' => '2023-10-08',
                'validUntil' => 'Nov 08, 2023',
                'validUntilIso' => '2023-11-08',
                'preparedFor' => [
                    'name' => 'Initech',
                    'attn' => 'Omar Vega',
                    'address' => "500 Office Park Drive\nAustin, TX 78759",
                    'email' => 'omar@initech.com',
                ],
                'summary' => 'This proposal covers a legacy system assessment for Initech, evaluating your current infrastructure and outlining a migration plan to a modern stack.',
                'scopeIntro' => 'We will deliver the following:',
                'scopeItems' => [
                    'Full audit of the existing legacy system and dependencies',
                    'Migration plan with phased milestones and risk assessment',
                ],
                'timeline' => 'The estimated time for completion is 2-3 weeks from the date of project commencement.',
                'lineItems' => [
                    ['name' => 'System audit', 'description' => 'Audit of the current legacy system and its dependencies.', 'qty' => 1, 'price' => '$4,000.00', 'total' => '$4,000.00'],
                    ['name' => 'Migration plan', 'description' => 'Phased migration plan with milestones and risk assessment.', 'qty' => 1, 'price' => '$5,000.00', 'total' => '$5,000.00'],
                ],
                'subtotal' => '$9,000.00',
                'taxLabel' => 'Tax (0%)',
                'taxAmount' => '$0.00',
                'total' => '$9,000.00',
                'notes' => 'This proposal is valid until the date above. Please reach out if you would like to discuss scope or pricing before accepting.',
                'linkedProject' => null,
                'currency' => 'USD',
            ],
        ];
    }

    /**
     * Get the stubbed reminders page data.
     *
     * @return array<string, mixed>
     */
    public function reminders(Team $team): array
    {
        $reminders = [
            [
                'id' => 1,
                'title' => 'Follow up with John Smith regarding the web redesign proposal',
                'bucket' => 'overdue',
                'dueLabel' => 'Oct 18, 2023',
                'dueSort' => 1,
                'completed' => false,
                'link' => ['kind' => 'proposal', 'label' => 'PRP-2023-010', 'id' => null],
            ],
            [
                'id' => 2,
                'title' => 'Send updated logo files to client',
                'bucket' => 'overdue',
                'dueLabel' => 'Yesterday',
                'dueSort' => 2,
                'completed' => false,
                'link' => ['kind' => 'project', 'label' => 'API Integration Layer', 'id' => 14],
            ],
            [
                'id' => 3,
                'title' => 'Call Alice for weekly sync meeting',
                'bucket' => 'today',
                'dueLabel' => '2:00 PM',
                'dueSort' => 3,
                'completed' => false,
                'link' => ['kind' => 'contact', 'label' => 'Alice Doe', 'id' => 125],
            ],
            [
                'id' => 4,
                'title' => 'Check bank for payment of Invoice INV-2023-040',
                'bucket' => 'today',
                'dueLabel' => 'Today',
                'dueSort' => 4,
                'completed' => true,
                'link' => ['kind' => 'invoice', 'label' => 'INV-2023-040', 'id' => 40],
            ],
            [
                'id' => 5,
                'title' => 'Renew domain and hosting for client project',
                'bucket' => 'upcoming',
                'dueLabel' => 'Nov 5, 2023',
                'dueSort' => 5,
                'completed' => false,
                'link' => null,
            ],
            [
                'id' => 6,
                'title' => 'Send monthly analytics report',
                'bucket' => 'upcoming',
                'dueLabel' => 'Nov 10, 2023',
                'dueSort' => 6,
                'completed' => false,
                'link' => ['kind' => 'contact', 'label' => 'Marcus Tan', 'id' => 126],
            ],
            [
                'id' => 7,
                'title' => 'Prepare Q4 proposal draft for Nexus Corp',
                'bucket' => 'upcoming',
                'dueLabel' => 'Nov 12, 2023',
                'dueSort' => 7,
                'completed' => false,
                'link' => ['kind' => 'proposal', 'label' => 'Brand Identity Package', 'id' => 23],
            ],
            [
                'id' => 8,
                'title' => 'Schedule kickoff call for Portfolio Redesign',
                'bucket' => 'upcoming',
                'dueLabel' => 'Nov 18, 2023',
                'dueSort' => 8,
                'completed' => false,
                'link' => ['kind' => 'project', 'label' => 'Portfolio Redesign', 'id' => 11],
            ],
        ];

        return [
            'summary' => [
                'allCount' => count($reminders),
                'todayCount' => count(array_filter($reminders, fn ($reminder) => $reminder['bucket'] === 'today')),
                'upcomingCount' => count(array_filter($reminders, fn ($reminder) => $reminder['bucket'] === 'upcoming')),
                'overdueCount' => count(array_filter($reminders, fn ($reminder) => $reminder['bucket'] === 'overdue')),
            ],
            'reminders' => $reminders,
        ];
    }

    /**
     * Get the stubbed profile library page data.
     *
     * @return array<string, mixed>
     */
    public function profiles(Team $team): array
    {
        return [
            'profiles' => $this->profileRecords(),
        ];
    }

    /**
     * Get the stubbed context needed to render the new-profile page.
     *
     * @return array<string, mixed>
     */
    public function profileCreateContext(Team $team): array
    {
        return [
            'defaults' => [
                'title' => '',
                'category' => '',
                'shortDescription' => '',
                'body' => '',
            ],
        ];
    }

    /**
     * Get the stubbed context needed to render the edit-profile page, or null when not found.
     *
     * @return array<string, mixed>|null
     */
    public function profileEditContext(Team $team, int $profileId): ?array
    {
        $profile = null;

        foreach ($this->profileRecords() as $candidate) {
            if (($candidate['id'] ?? null) === $profileId) {
                $profile = $candidate;
                break;
            }
        }

        if ($profile === null) {
            return null;
        }

        return [
            'profile' => $profile,
        ];
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function profileRecords(): array
    {
        return [
            [
                'id' => 1,
                'title' => 'Default Company Profile',
                'description' => 'Standard agency profile containing our history, mission, core values, and standard services offered.',
                'category' => 'company',
                'categoryLabel' => 'Company Info',
                'icon' => 'i-briefcase',
                'updatedAt' => 'Updated 2d ago',
                'shortDescription' => 'Standard agency profile containing our history, mission, core values, and standard services offered.',
                'body' => "Biondesk Creative Agency was founded in 2018 with a single mission: to build interfaces that feel alive.\n\nOur core services include:\n- Product Strategy & Research\n- UX/UI Design for Web & Mobile\n- Design Systems",
                'hasImage' => true,
            ],
            [
                'id' => 2,
                'title' => 'John - Lead Designer Bio',
                'description' => 'Professional biography for John, highlighting 10+ years of UX/UI experience and award-winning projects.',
                'category' => 'team',
                'categoryLabel' => 'Team Bio',
                'icon' => 'i-user',
                'updatedAt' => 'Updated 1w ago',
                'shortDescription' => 'Professional biography for John, highlighting 10+ years of UX/UI experience and award-winning projects.',
                'body' => 'John has spent over a decade crafting interfaces for startups and enterprise teams alike, with a focus on accessibility and motion design.',
                'hasImage' => false,
            ],
            [
                'id' => 3,
                'title' => 'Case Study: FinTech App',
                'description' => 'Detailed case study outlining our process, challenges, and results for the recent mobile banking app redesign.',
                'category' => 'case',
                'categoryLabel' => 'Case Study',
                'icon' => 'i-layers',
                'updatedAt' => 'Updated 3w ago',
                'shortDescription' => 'Detailed case study outlining our process, challenges, and results for the recent mobile banking app redesign.',
                'body' => 'The client came to us with a legacy banking app suffering from poor retention. Over 12 weeks we redesigned the onboarding flow, reducing drop-off by 34%.',
                'hasImage' => false,
            ],
            [
                'id' => 4,
                'title' => 'Brand Assets & Logos',
                'description' => 'Collection of our agency logos, typography rules, color palettes, and usage guidelines.',
                'category' => 'asset',
                'categoryLabel' => 'Assets',
                'icon' => 'i-image',
                'updatedAt' => 'Updated 1mo ago',
                'shortDescription' => 'Collection of our agency logos, typography rules, color palettes, and usage guidelines.',
                'body' => 'This asset pack includes primary and secondary logo marks, the full typography scale, and the approved color palette for co-branded materials.',
                'hasImage' => false,
            ],
            [
                'id' => 5,
                'title' => 'Sarah - Project Manager',
                'description' => 'Bio for Sarah, focusing on agile methodologies, communication skills, and delivering projects on time.',
                'category' => 'team',
                'categoryLabel' => 'Team Bio',
                'icon' => 'i-user',
                'updatedAt' => 'Updated 1mo ago',
                'shortDescription' => 'Bio for Sarah, focusing on agile methodologies, communication skills, and delivering projects on time.',
                'body' => 'Sarah keeps every engagement on track with a light-touch agile process, weekly client demos, and a zero-surprises delivery philosophy.',
                'hasImage' => false,
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

    /**
     * Get the stubbed public lead form settings data.
     *
     * @return array<string, mixed>
     */
    public function publicLeadFormSettings(Team $team): array
    {
        return [
            'formUrl' => "https://biondesk.com/f/{$team->slug}",
            'enabled' => true,
            'formTitle' => "Work with {$team->name}",
            'welcomeMessage' => "Fill out the form below to tell us about your project, and we'll get back to you within 24 hours.",
            'backgroundTheme' => 'dark',
            'services' => ['Brand Identity', 'Web Design', 'App Development', 'Marketing Strategy'],
            'askBudget' => true,
            'allowAttachments' => false,
        ];
    }

    /**
     * Get the stubbed public document (shared invoice/quotation/proposal) page data,
     * or null when no document matches the given slug for this team.
     *
     * @return array<string, mixed>|null
     */
    public function publicDocumentContext(Team $team, string $document): ?array
    {
        $slug = mb_strtolower($document);

        foreach ($this->invoices($team)['invoices'] as $invoice) {
            if (mb_strtolower($invoice['number']) === $slug) {
                $detail = $this->invoiceDetail($team, $invoice['id']);

                return $detail === null ? null : [
                    'document' => $this->normalizePublicInvoice($detail['invoice']),
                ];
            }
        }

        foreach ($this->quotations($team)['quotations'] as $quotation) {
            if (mb_strtolower($quotation['number']) === $slug) {
                $detail = $this->quotationDetail($team, $quotation['id']);

                return $detail === null ? null : [
                    'document' => $this->normalizePublicQuotation($detail['quotation']),
                ];
            }
        }

        foreach ($this->proposals($team)['documents'] as $proposalDocument) {
            if (mb_strtolower($proposalDocument['number']) === $slug) {
                $detail = $this->proposalDetail($team, $proposalDocument['id']);

                return $detail === null ? null : [
                    'document' => $this->normalizePublicProposal($detail['proposal']),
                ];
            }
        }

        return null;
    }

    /**
     * @param  array<string, mixed>  $invoice
     * @return array<string, mixed>
     */
    private function normalizePublicInvoice(array $invoice): array
    {
        return [
            'kind' => 'invoice',
            'kindLabel' => 'Invoice',
            'number' => $invoice['number'],
            'context' => $invoice['context'],
            'statusLabel' => $invoice['statusLabel'],
            'tone' => $invoice['tone'],
            'business' => $invoice['business'],
            'recipient' => [
                'label' => 'Bill To',
                'name' => $invoice['billTo']['name'],
                'attn' => $invoice['billTo']['attn'],
                'address' => $invoice['billTo']['address'],
                'email' => $invoice['billTo']['email'],
            ],
            'dateFields' => [
                ['label' => 'Invoice Number', 'value' => $invoice['number'], 'danger' => false],
                ['label' => 'Date Issued', 'value' => $invoice['issuedAt'], 'danger' => false],
                ['label' => 'Due Date', 'value' => $invoice['dueAt'], 'danger' => $invoice['status'] === 'overdue'],
            ],
            'lineItems' => $invoice['lineItems'],
            'subtotal' => $invoice['subtotal'],
            'adjustmentLabel' => $invoice['taxLabel'],
            'adjustmentAmount' => $invoice['taxAmount'],
            'totalLabel' => 'Invoice Total',
            'total' => $invoice['total'],
            'amountPaid' => $invoice['amountPaid'],
            'amountDue' => $invoice['amountDue'],
            'notesLabel' => 'Payment Instructions',
            'notes' => $invoice['paymentInstructions'],
            'primaryActionLabel' => 'Pay Now',
            'currency' => $invoice['currency'],
        ];
    }

    /**
     * @param  array<string, mixed>  $quotation
     * @return array<string, mixed>
     */
    private function normalizePublicQuotation(array $quotation): array
    {
        return [
            'kind' => 'quotation',
            'kindLabel' => 'Quotation',
            'number' => $quotation['number'],
            'context' => $quotation['context'],
            'statusLabel' => $quotation['statusLabel'],
            'tone' => $quotation['tone'],
            'business' => $quotation['business'],
            'recipient' => [
                'label' => 'Prepared For',
                'name' => $quotation['preparedFor']['name'],
                'attn' => $quotation['preparedFor']['attn'],
                'address' => $quotation['preparedFor']['address'],
                'email' => $quotation['preparedFor']['email'],
            ],
            'dateFields' => [
                ['label' => 'Quotation Number', 'value' => $quotation['number'], 'danger' => false],
                ['label' => 'Date Issued', 'value' => $quotation['issuedAt'], 'danger' => false],
                ['label' => 'Valid Until', 'value' => $quotation['expiryAt'], 'danger' => $quotation['status'] === 'declined'],
            ],
            'lineItems' => $quotation['lineItems'],
            'subtotal' => $quotation['subtotal'],
            'adjustmentLabel' => $quotation['discountLabel'],
            'adjustmentAmount' => $quotation['discountAmount'],
            'totalLabel' => 'Quotation Total',
            'total' => $quotation['total'],
            'amountPaid' => null,
            'amountDue' => null,
            'notesLabel' => 'Terms & Conditions',
            'notes' => $quotation['terms'],
            'primaryActionLabel' => 'Accept Quotation',
            'currency' => $quotation['currency'],
        ];
    }

    /**
     * @param  array<string, mixed>  $proposal
     * @return array<string, mixed>
     */
    private function normalizePublicProposal(array $proposal): array
    {
        return [
            'kind' => 'proposal',
            'kindLabel' => 'Proposal',
            'number' => $proposal['number'],
            'context' => $proposal['title'],
            'statusLabel' => $proposal['stageLabel'],
            'tone' => $proposal['tone'],
            'business' => $proposal['business'],
            'recipient' => [
                'label' => 'Prepared For',
                'name' => $proposal['preparedFor']['name'],
                'attn' => $proposal['preparedFor']['attn'],
                'address' => $proposal['preparedFor']['address'],
                'email' => $proposal['preparedFor']['email'],
            ],
            'dateFields' => [
                ['label' => 'Proposal Number', 'value' => $proposal['number'], 'danger' => false],
                ['label' => 'Date Prepared', 'value' => $proposal['datePrepared'], 'danger' => false],
                ['label' => 'Valid Until', 'value' => $proposal['validUntil'], 'danger' => false],
            ],
            'lineItems' => $proposal['lineItems'],
            'subtotal' => $proposal['subtotal'],
            'adjustmentLabel' => $proposal['taxLabel'],
            'adjustmentAmount' => $proposal['taxAmount'],
            'totalLabel' => 'Proposal Total',
            'total' => $proposal['total'],
            'amountPaid' => null,
            'amountDue' => null,
            'notesLabel' => 'Notes',
            'notes' => $proposal['notes'],
            'primaryActionLabel' => 'Accept Proposal',
            'currency' => $proposal['currency'],
        ];
    }
}
