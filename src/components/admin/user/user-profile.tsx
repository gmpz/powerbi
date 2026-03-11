
import UserProfileCard from './user-profile-card'
import { getCurrentUser, getUserById } from '@/actions/admin/user/action';

const UserProfile = async ({ userId} : { userId: string}) => {
    const user = await getUserById(userId);
    const currentUserId = await getCurrentUser();
  return (
    <UserProfileCard user={user!} currentUserId={currentUserId} />
  )
}

export default UserProfile