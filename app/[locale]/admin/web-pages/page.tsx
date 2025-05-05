import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import DeleteDialog from '@/components/shared/delete-dialog'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatId } from '@/lib/utils'
import { Metadata } from 'next'
import { deleteWebPage, getAllWebPages } from '@/lib/actions/web-page.actions'
import { IWebPage } from '@/lib/db/models/web-page.model'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('WebPageAdmin')
  return {
    title: t('metadata.title'),
  }
}

export default async function WebPageAdminPage() {
  const t = await getTranslations('WebPageAdmin')
  const webPages = await getAllWebPages()

  return (
    <div className='space-y-2'>
      <div className='flex-between'>
        <h1 className='h1-bold'>{t('title')}</h1>
        <Button asChild variant='default'>
          <Link href='/admin/web-pages/create'>{t('createButton')}</Link>
        </Button>
      </div>
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[100px]'>
                {t('tableHeaders.id')}
              </TableHead>
              <TableHead>{t('tableHeaders.name')}</TableHead>
              <TableHead>{t('tableHeaders.slug')}</TableHead>
              <TableHead>{t('tableHeaders.isPublished')}</TableHead>
              <TableHead className='w-[100px]'>
                {t('tableHeaders.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {webPages.map((webPage: IWebPage) => (
              <TableRow key={webPage._id}>
                <TableCell>{formatId(webPage._id)}</TableCell>
                <TableCell>{webPage.title}</TableCell>
                <TableCell>{webPage.slug}</TableCell>
                <TableCell>
                  {webPage.isPublished ? t('yes') : t('no')}
                </TableCell>
                <TableCell className='flex gap-1'>
                  <Button asChild variant='outline' size='sm'>
                    <Link href={`/admin/web-pages/${webPage._id}`}>
                      {t('edit')}
                    </Link>
                  </Button>
                  <DeleteDialog id={webPage._id} action={deleteWebPage} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
