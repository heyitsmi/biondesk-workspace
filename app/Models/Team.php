<?php

namespace App\Models;

use App\Concerns\GeneratesUniqueTeamSlugs;
use App\Enums\LeadFormBackgroundTheme;
use App\Enums\SocialLinkPlatform;
use App\Enums\TeamRole;
use Database\Factories\TeamFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property string|null $lead_form_slug
 * @property bool $is_personal
 * @property bool $lead_form_enabled
 * @property string|null $lead_form_title
 * @property string|null $lead_form_description
 * @property string|null $lead_form_welcome_message
 * @property LeadFormBackgroundTheme $lead_form_background_theme
 * @property string|null $lead_form_background_color
 * @property list<string>|null $lead_form_services
 * @property array<int, mixed>|null $lead_form_social_links
 * @property string|null $lead_form_meta_title
 * @property string|null $lead_form_meta_description
 * @property bool $lead_form_ask_budget
 * @property bool $lead_form_allow_attachments
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 * @property-read Collection<int, TeamInvitation> $invitations
 * @property-read Collection<int, Membership> $memberships
 * @property-read Collection<int, User> $members
 */
#[Fillable([
    'name', 'slug', 'is_personal', 'lead_form_enabled', 'lead_form_slug', 'lead_form_title',
    'lead_form_description', 'lead_form_welcome_message', 'lead_form_background_theme',
    'lead_form_background_color', 'lead_form_services', 'lead_form_social_links',
    'lead_form_meta_title', 'lead_form_meta_description',
    'lead_form_ask_budget', 'lead_form_allow_attachments',
])]
class Team extends Model implements HasMedia
{
    /** @use HasFactory<TeamFactory> */
    use GeneratesUniqueTeamSlugs, HasFactory, InteractsWithMedia, SoftDeletes;

    /**
     * Default "what do you need help with" options for teams that haven't customized them yet.
     *
     * @var array<int, string>
     */
    public const DEFAULT_LEAD_FORM_SERVICES = ['Brand Identity', 'Web Design', 'App Development', 'Marketing Strategy'];

    /**
     * Bootstrap the model and its traits.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (Team $team) {
            if (empty($team->slug)) {
                $team->slug = static::generateUniqueTeamSlug($team->name);
            }
        });

        static::updating(function (Team $team) {
            if ($team->isDirty('name')) {
                $team->slug = static::generateUniqueTeamSlug($team->name, $team->id);
            }
        });
    }

    /**
     * Get the team owner.
     */
    public function owner(): ?User
    {
        return $this->members()
            ->wherePivot('role', TeamRole::Owner->value)
            ->first();
    }

    /**
     * Get all members of this team.
     *
     * @return BelongsToMany<User, $this, Membership, 'pivot'>
     */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'team_members', 'team_id', 'user_id')
            ->using(Membership::class)
            ->withPivot(['role'])
            ->withTimestamps();
    }

    /**
     * Get all memberships for this team.
     *
     * @return HasMany<Membership, $this>
     */
    public function memberships(): HasMany
    {
        return $this->hasMany(Membership::class);
    }

    /**
     * Get all invitations for this team.
     *
     * @return HasMany<TeamInvitation, $this>
     */
    public function invitations(): HasMany
    {
        return $this->hasMany(TeamInvitation::class);
    }

    /**
     * Get all contacts for this team.
     *
     * @return HasMany<Contact, $this>
     */
    public function contacts(): HasMany
    {
        return $this->hasMany(Contact::class);
    }

    /**
     * Get all opportunities for this team.
     *
     * @return HasMany<Opportunity, $this>
     */
    public function opportunities(): HasMany
    {
        return $this->hasMany(Opportunity::class);
    }

    /**
     * Get all projects for this team.
     *
     * @return HasMany<Project, $this>
     */
    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }

    /**
     * Get all documents (proposals, quotes, invoices) for this team.
     *
     * @return HasMany<Document, $this>
     */
    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }

    /**
     * Get all recurring invoice templates for this team.
     *
     * @return HasMany<RecurringInvoiceTemplate, $this>
     */
    public function recurringInvoiceTemplates(): HasMany
    {
        return $this->hasMany(RecurringInvoiceTemplate::class);
    }

    /**
     * Get all calendar events for this team.
     *
     * @return HasMany<Event, $this>
     */
    public function events(): HasMany
    {
        return $this->hasMany(Event::class);
    }

    /**
     * Get all profile library assets for this team.
     *
     * @return HasMany<ProfileAsset, $this>
     */
    public function profileAssets(): HasMany
    {
        return $this->hasMany(ProfileAsset::class);
    }

    /**
     * Get all BionAI conversations for this team.
     *
     * @return HasMany<BionAiConversation, $this>
     */
    public function bionAiConversations(): HasMany
    {
        return $this->hasMany(BionAiConversation::class);
    }

    /**
     * Get the lead form banner URL, or null when no banner has been uploaded.
     */
    public function leadFormBannerUrl(): ?string
    {
        $url = $this->getFirstMediaUrl('lead-form-banner');

        return $url === '' ? null : $url;
    }

    /**
     * Get the lead form custom background image URL, or null when none has been uploaded.
     */
    public function leadFormBackgroundImageUrl(): ?string
    {
        $url = $this->getFirstMediaUrl('lead-form-background');

        return $url === '' ? null : $url;
    }

    /**
     * Get the lead form cover banner URL, or null when none has been uploaded.
     */
    public function leadFormCoverUrl(): ?string
    {
        $url = $this->getFirstMediaUrl('lead-form-cover');

        return $url === '' ? null : $url;
    }

    /**
     * Get the lead form social sharing (OG) image URL, or null when none has been uploaded.
     */
    public function leadFormOgImageUrl(): ?string
    {
        $url = $this->getFirstMediaUrl('lead-form-og-image');

        return $url === '' ? null : $url;
    }

    /**
     * Register the media collections for this model.
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('lead-form-banner')->singleFile();
        $this->addMediaCollection('lead-form-background')->singleFile();
        $this->addMediaCollection('lead-form-cover')->singleFile();
        $this->addMediaCollection('lead-form-og-image')->singleFile();
    }

    /**
     * Get the public lead form URL slug: the custom slug if set, otherwise the team slug.
     */
    public function leadFormPublicSlug(): string
    {
        return $this->lead_form_slug ?: $this->slug;
    }

    /**
     * Find a team by its public lead form identifier (custom slug or team slug).
     */
    public static function findByLeadFormSlug(string $identifier): self
    {
        return static::where('lead_form_slug', $identifier)
            ->orWhere('slug', $identifier)
            ->firstOrFail();
    }

    /**
     * Determine whether the given slug is already used as a team slug or a custom
     * lead form slug by another team.
     */
    public static function leadFormSlugTaken(string $slug, ?int $exceptTeamId = null): bool
    {
        return static::withTrashed()
            ->where(fn ($query) => $query->where('slug', $slug)->orWhere('lead_form_slug', $slug))
            ->when($exceptTeamId, fn ($query) => $query->where('id', '!=', $exceptTeamId))
            ->exists();
    }

    /**
     * Get the lead form social/custom links, filtering out any malformed entries.
     *
     * @return array<int, array{platform: string, url: string}>
     */
    public function leadFormSocialLinks(): array
    {
        return collect($this->lead_form_social_links ?? [])
            ->filter(fn ($link) => is_array($link)
                && is_string($link['platform'] ?? null)
                && SocialLinkPlatform::tryFrom($link['platform']) !== null
                && is_string($link['url'] ?? null)
                && $link['url'] !== '')
            ->map(fn (array $link) => ['platform' => $link['platform'], 'url' => $link['url']])
            ->values()
            ->all();
    }

    /**
     * Get the resolved public lead form settings, applying sensible fallbacks.
     *
     * @return array<string, mixed>
     */
    public function leadFormSettings(): array
    {
        $title = $this->lead_form_title ?: "Work with {$this->name}";
        $welcomeMessage = $this->lead_form_welcome_message
            ?: "Fill out the form below to tell us about your project, and we'll get back to you within 24 hours.";

        return [
            'enabled' => $this->lead_form_enabled,
            'slug' => $this->leadFormPublicSlug(),
            'customSlug' => $this->lead_form_slug,
            'title' => $title,
            'welcomeMessage' => $welcomeMessage,
            'backgroundTheme' => $this->lead_form_background_theme->value,
            'backgroundColor' => $this->lead_form_background_color,
            'backgroundImageUrl' => $this->leadFormBackgroundImageUrl(),
            'coverUrl' => $this->leadFormCoverUrl(),
            'services' => $this->lead_form_services ?: self::DEFAULT_LEAD_FORM_SERVICES,
            'socialLinks' => $this->leadFormSocialLinks(),
            'askBudget' => $this->lead_form_ask_budget,
            'allowAttachments' => $this->lead_form_allow_attachments,
            'bannerUrl' => $this->leadFormBannerUrl(),
            'metaTitle' => $this->lead_form_meta_title ?: $title,
            'metaDescription' => $this->lead_form_meta_description ?: Str::limit($welcomeMessage, 160),
            'ogImageUrl' => $this->leadFormOgImageUrl() ?: $this->leadFormCoverUrl() ?: $this->leadFormBannerUrl(),
        ];
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_personal' => 'boolean',
            'lead_form_enabled' => 'boolean',
            'lead_form_background_theme' => LeadFormBackgroundTheme::class,
            'lead_form_services' => 'array',
            'lead_form_social_links' => 'array',
            'lead_form_ask_budget' => 'boolean',
            'lead_form_allow_attachments' => 'boolean',
        ];
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
