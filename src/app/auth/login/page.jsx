'use client';

import Link from 'next/link';
import Button from '@/components/common/Button';
import Image from 'next/image';
import GoogleButton from '@/components/common/GoogleButton';
import {AuthInput} from '@/components/ui/input';
import {useModal} from '@/components/modal/ModalContext';
import {useAuth} from '@/providers/AuthProvider';
import {useRouter} from 'next/navigation';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {LoginSchema} from '@/schemas/login.schema';

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: {errors, isValid},
  } = useForm({
    resolver: zodResolver(LoginSchema),
    mode: 'onChange',
  });

  const {openModal} = useModal();
  const {login} = useAuth();
  const router = useRouter();

  const onSubmit = async data => {
    try {
      const success = await login(data);
      if (success) {
        router.push('/market');
      } else {
        throw new Error('로그인 실패');
      }
    } catch (error) {
      openModal({
        type: 'alert',
        title: '로그인 실패',
        description: '이메일 또는 비밀번호가\n올바르지 않습니다.',
        button: {label: '확인'},
      });
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5005/auth/google';
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="w-full max-w-[345px] tablet:max-w-[440px] pc:max-w-[520px]">
        {/* 로고 */}
        <div className="flex justify-center mb-20">
          <Link href={'/'}>
            <figure className="relative w-[189px] h-[35px] tablet:w-[331px] tablet:h-[60px]">
              <Image
                src={'/logo.svg'}
                fill
                className="object-cover fill"
                alt="로고"
              />
            </figure>
          </Link>
        </div>

        {/* 로그인 폼 */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-8 w-full">
            <AuthInput
              label="이메일"
              name="email"
              type="email"
              placeholder="이메일을 입력해 주세요"
              {...register('email')}
              error={errors.email?.message}
            />

            <AuthInput
              label="비밀번호"
              name="password"
              type="password"
              placeholder="비밀번호를 입력해 주세요"
              {...register('password')}
              error={errors.password?.message}
            />
          </div>

          <Button
            type="submit"
            disabled={!isValid}
            role="default"
            variant="primary"
            fullWidth={true}
            className="mt-11 mb-4"
          >
            로그인
          </Button>

          <GoogleButton onClick={handleGoogleLogin} />
        </form>

        {/* 회원가입 링크 */}
        <div className="mt-11 text-center text-[14px] font-[400] pc:text-[16px]">
          <span className="text-white mr-3">최애의 포토가 처음이신가요?</span>
          <Link
            href="/auth/signup"
            className="text-main underline hover:opacity-80"
          >
            회원가입하기
          </Link>
        </div>
      </div>
    </main>
  );
}
