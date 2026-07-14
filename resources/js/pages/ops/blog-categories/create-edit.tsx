import { Head, Link, useForm } from '@inertiajs/react';

import { ArrowLeft } from 'lucide-react';
import type { FormEventHandler } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { dashboard as opsDashboard } from '@/routes/ops';
import { index as opsBlogCategoriesIndex, store as opsBlogCategoriesStore, update as opsBlogCategoriesUpdate } from '@/routes/ops/blog-categories';

export default function CreateEdit({ category }: { category?: any }) {
    const isEdit = !!category;

    const { data, setData, post, processing, errors } = useForm({
        name: category?.name || '',
        meta_title: category?.meta_title || '',
        meta_description: category?.meta_description || '',
        og_image: null as File | null,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (isEdit) {
            // Need to use POST with _method=PUT to handle file uploads in Inertia/Laravel
            post(opsBlogCategoriesUpdate({ blog_category: category.id }).url, {
                data: {
                    _method: 'PUT',
                    ...data,
                } as any
            });
        } else {
            post(opsBlogCategoriesStore().url);
        }
    };

    return (
        <>
            <Head title={isEdit ? 'Edit Category' : 'Create Category'} />

            <div className="mb-[20px] flex items-center gap-[12px]">
                <Button variant="outline" size="icon" className="h-[32px] w-[32px]" asChild>
                    <Link href={opsBlogCategoriesIndex().url}>
                        <ArrowLeft className="h-[15px] w-[15px]" />
                    </Link>
                </Button>
                <h1 className="text-[18px] font-semibold">{isEdit ? 'Edit Category' : 'Create Category'}</h1>
            </div>

            <div className="rounded-[12px] border border-bion-border bg-bion-surface p-[24px]">
                <form onSubmit={submit} className="flex flex-col gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g. Workflow"
                        />
                        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="meta_title">Meta Title</Label>
                        <Input
                            id="meta_title"
                            value={data.meta_title}
                            onChange={(e) => setData('meta_title', e.target.value)}
                            placeholder="Optional SEO title"
                        />
                        {errors.meta_title && <p className="text-sm text-red-500">{errors.meta_title}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="meta_description">Meta Description</Label>
                        <Textarea
                            id="meta_description"
                            value={data.meta_description}
                            onChange={(e) => setData('meta_description', e.target.value)}
                            placeholder="Optional SEO description"
                            rows={3}
                        />
                        {errors.meta_description && <p className="text-sm text-red-500">{errors.meta_description}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="og_image">OG Image (Thumbnail)</Label>
                        {isEdit && category.media && category.media.length > 0 && (
                            <div className="mb-2">
                                <img src={category.media[0].original_url} alt="Current OG Image" className="h-32 object-cover rounded-md" />
                            </div>
                        )}
                        <Input
                            id="og_image"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setData('og_image', e.target.files?.[0] || null)}
                        />
                        {errors.og_image && <p className="text-sm text-red-500">{errors.og_image}</p>}
                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                        <Button variant="outline" type="button" asChild>
                            <Link href={opsBlogCategoriesIndex().url}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {isEdit ? 'Update Category' : 'Create Category'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

CreateEdit.layout = () => ({
    breadcrumbs: [
        { title: 'Dashboard', href: opsDashboard() },
        { title: 'Blog Categories', href: opsBlogCategoriesIndex() },
        { title: 'Create / Edit', href: '#' },
    ],
});
