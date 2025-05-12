import LanguageSwitcher from './language-switcher'
import ThemeSwitcher from './theme-switcher'

export function CustomSwitchers() {
  return (
    <div className='flex flex-col gap-2'>
      <LanguageSwitcher />
      <ThemeSwitcher />
    </div>
  )
}
