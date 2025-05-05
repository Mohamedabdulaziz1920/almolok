import { Metadata } from 'next'
import WebPageForm from '../web-page-form'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('WebPage')
  return {
    title: t('create.metadata.title'),
  }
}

export default async function CreateWebPagePage() {
  const t = await getTranslations('WebPage')

  return (
    <>
      <h1 className='h1-bold'>{t('create.title')}</h1>
      <div className='my-8'>
        <WebPageForm type='Create' />
      </div>
    </>
  )
}
