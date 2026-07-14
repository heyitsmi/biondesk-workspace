import { Head, Link, useForm } from '@inertiajs/react';
import { Plus, Pencil, Trash } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { dashboard as opsDashboard } from '@/routes/ops';
import { index as opsBlogsIndex } from '@/routes/ops/blogs';
import { create as opsBlogsCreate, edit as opsBlogsEdit, destroy as opsBlogsDestroy } from '@/routes/ops/blogs';

interface Blog {
    id: number;
    title: string;
    slug: string;
    is_published: boolean;
    created_at: string;
    category?: { name: string };
    author?: { name: string };
}

export default function Index({ blogs }: { blogs: any }) {
    const { delete: destroy } = useForm();

    const handleDelete = (id: number) => {
        destroy(opsBlogsDestroy({ blog: id }).url);
    };

    return (
        <>
            <Head title="Blogs - Ops" />

            <div className="mb-[20px] flex justify-end">
                <Button asChild>
                    <Link href={opsBlogsCreate().url}>
                        <Plus className="mr-2 w-4 h-4" /> Add Blog
                    </Link>
                </Button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[12px] border border-bion-border bg-bion-surface">
                <div className="min-h-0 flex-1 overflow-y-auto">
                    <Table className="w-full border-collapse">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Author</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead className="w-[100px] text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {blogs.data.map((blog: Blog) => (
                                <TableRow key={blog.id}>
                                    <TableCell className="font-medium">{blog.title}</TableCell>
                                    <TableCell>{blog.category?.name || '-'}</TableCell>
                                    <TableCell>{blog.author?.name || '-'}</TableCell>
                                    <TableCell>
                                        {blog.is_published ? (
                                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Published</span>
                                        ) : (
                                            <span className="px-2 py-1 bg-neutral-100 text-neutral-800 text-xs rounded-full">Draft</span>
                                        )}
                                    </TableCell>
                                    <TableCell>{new Date(blog.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={opsBlogsEdit({ blog: blog.id }).url}>
                                                    <Pencil className="w-4 h-4" />
                                                </Link>
                                            </Button>

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                                        <Trash className="w-4 h-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete the blog post.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(blog.id)} className="bg-red-500 hover:bg-red-600">
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {blogs.data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        No blogs found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </>
    );
}

Index.layout = () => ({
    breadcrumbs: [
        { title: 'Dashboard', href: opsDashboard() },
        { title: 'Blogs', href: opsBlogsIndex() },
    ],
});
