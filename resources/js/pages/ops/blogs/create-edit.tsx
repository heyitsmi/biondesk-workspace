import { Head, Link, useForm } from '@inertiajs/react';

import { ArrowLeft } from 'lucide-react';
import type { FormEventHandler } from 'react';
import { RichTextEditor } from '@/components/rich-text-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { dashboard as opsDashboard } from '@/routes/ops';
import { index as opsBlogsIndex, store as opsBlogsStore, update as opsBlogsUpdate } from '@/routes/ops/blogs';

export default function CreateEdit({ blog, categories }: { blog?: any; categories: any[] }) {
    const isEdit = !!blog;

    const { data, setData, post, processing, errors } = useForm({
        title: blog?.title || '',
        category_id: blog?.category_id || '',
        description: blog?.description || '',
        content: blog?.content || '',
        meta_title: blog?.meta_title || '',
        meta_description: blog?.meta_description || '',
        is_published: blog?.is_published ? true : false,
        thumbnail: null as File | null,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (isEdit) {
            post(opsBlogsUpdate({ blog: blog.id }).url, {
                data: {
                    _method: 'PUT',
                    ...data,
                } as any
            });
        } else {
            post(opsBlogsStore().url);
        }
    };

    return (
        <>
            <Head title={isEdit ? 'Edit Blog' : 'Create Blog'} />

            <div className="mb-[20px] flex items-center gap-[12px]">
                <Button variant="outline" size="icon" className="h-[32px] w-[32px]" asChild>
                    <Link href={opsBlogsIndex().url}>
                        <ArrowLeft className="h-[15px] w-[15px]" />
                    </Link>
                </Button>
                <h1 className="text-[18px] font-semibold">{isEdit ? 'Edit Blog' : 'Create Blog'}</h1>
            </div>

            <div className="rounded-[12px] border border-bion-border bg-bion-surface p-[24px]">
                <form onSubmit={submit} className="flex flex-col gap-8">
                    {/* Main Information */}
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold border-b pb-2">Main Information</h2>

                        <div className="grid gap-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder="e.g. Why we stopped using four different apps..."
                            />
                            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="category_id">Category</Label>
                            <select
                                id="category_id"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={data.category_id}
                                onChange={(e) => setData('category_id', e.target.value)}
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            {errors.category_id && <p className="text-sm text-red-500">{errors.category_id}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Short Description / Excerpt</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="A short description that appears on the blog index."
                                rows={3}
                            />
                            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label>Content</Label>
                            <RichTextEditor
                                value={data.content}
                                onChange={(val) => setData('content', val)}
                            />
                            {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="thumbnail">Thumbnail Image</Label>
                            {isEdit && blog.media && blog.media.length > 0 && (
                                <div className="mb-2">
                                    <img src={blog.media[0].original_url} alt="Thumbnail" className="h-32 object-cover rounded-md" />
                                </div>
                            )}
                            <Input
                                id="thumbnail"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setData('thumbnail', e.target.files?.[0] || null)}
                            />
                            {errors.thumbnail && <p className="text-sm text-red-500">{errors.thumbnail}</p>}
                        </div>
                    </div>

                    {/* SEO Information */}
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold border-b pb-2">SEO & Settings</h2>

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
                                rows={2}
                            />
                            {errors.meta_description && <p className="text-sm text-red-500">{errors.meta_description}</p>}
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_published"
                                className="w-4 h-4 rounded border-gray-300 text-bion-accent focus:ring-bion-accent"
                                checked={data.is_published}
                                onChange={(e) => setData('is_published', e.target.checked)}
                            />
                            <Label htmlFor="is_published" className="cursor-pointer">Published (visible to public)</Label>
                            {errors.is_published && <p className="text-sm text-red-500">{errors.is_published}</p>}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                        <Button variant="outline" type="button" asChild>
                            <Link href={opsBlogsIndex().url}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {isEdit ? 'Update Blog' : 'Create Blog'}
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
        { title: 'Blogs', href: opsBlogsIndex() },
        { title: 'Create / Edit', href: '#' },
    ],
});
