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
import { index as opsBlogCategoriesIndex } from '@/routes/ops/blog-categories';
import { create as opsBlogCategoriesCreate, edit as opsBlogCategoriesEdit, destroy as opsBlogCategoriesDestroy } from '@/routes/ops/blog-categories';

interface Category {
    id: number;
    name: string;
    slug: string;
    created_at: string;
}

export default function Index({ categories }: { categories: any }) {
    const { delete: destroy } = useForm();

    const handleDelete = (id: number) => {
        destroy(opsBlogCategoriesDestroy({ blog_category: id }).url);
    };

    return (
        <>
            <Head title="Blog Categories - Ops" />

            <div className="mb-[20px] flex justify-end">
                <Button asChild>
                    <Link href={opsBlogCategoriesCreate().url}>
                        <Plus className="mr-2 w-4 h-4" /> Add Category
                    </Link>
                </Button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[12px] border border-bion-border bg-bion-surface">
                <div className="min-h-0 flex-1 overflow-y-auto">
                    <Table className="w-full border-collapse">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead className="w-[100px] text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.data.map((category: Category) => (
                                <TableRow key={category.id}>
                                    <TableCell className="font-medium">{category.name}</TableCell>
                                    <TableCell>{category.slug}</TableCell>
                                    <TableCell>{new Date(category.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={opsBlogCategoriesEdit({ blog_category: category.id }).url}>
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
                                                            This action cannot be undone. This will permanently delete the category.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(category.id)} className="bg-red-500 hover:bg-red-600">
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {categories.data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                        No categories found.
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
        { title: 'Blog Categories', href: opsBlogCategoriesIndex() },
    ],
});
