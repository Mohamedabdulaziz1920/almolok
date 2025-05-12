import { getUserById } from '@/lib/actions/user.actions'
import AddBalanceForm from '../add-balance-form'

export default async function AddBalancePage({
  params,
}: {
  params: { id: string }
}) {
  const user = await getUserById(params.id)

  if (!user) {
    return <div>المستخدم غير موجود</div>
  }

  return <AddBalanceForm user={user} />
}
