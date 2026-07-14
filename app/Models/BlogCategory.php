<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class BlogCategory extends Model implements HasMedia
{
    use InteractsWithMedia;

    protected $fillable = [
        'name',
        'slug',
        'meta_title',
        'meta_description',
    ];

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('og_image')
            ->singleFile();
    }
}
