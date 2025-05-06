import { getNoCachedSetting } from '@/lib/actions/setting.actions'
import SettingForm from './setting-form'

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Setting',
}
const SettingPage = async () => {
  return (
    <div>
      <main className='col-span-4 '>
        <div className='my-8'>
          <SettingForm setting={await getNoCachedSetting()} />
        </div>
      </main>
    </div>
  )
}

export default SettingPage
