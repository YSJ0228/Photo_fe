import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <div className="max-w-[744px] mx-auto mt-[33px] px-[16px] overflow-x-hidden tablet:max-w-[1200px] tablet:mt-[23px] tablet:px-[33px] pc:max-w-full pc:mt-[13px] pc:px-[60 px]">
        <section className="bg-custom-landing1bg w-full h-[412px] rounded-[24px] flex flex-col items-center tablet:h-[722px] pc:h-[1088px]">
          <Image
            src={"/logo.svg"}
            width={138}
            height={25}
            alt="로고"
            className="hidden tablet:block tablet:mt-[67px] pc:mt-[77px]"
          />
          <div className="mt-[49px] tablet:mt-[22px]">
            <p className="text-[20px] font-bold text-center leading-[1.2] tablet:text-[40px]">
              구하기 어려웠던
              <br />
              <span className="text-[var(--color-main)]">나의 최애</span>가
              여기에!
            </p>
          </div>
          <Link
            href={"/product"}
            className="text-[var(--color-black)] font-bold text-[12px] mt-[24px] mb-[26px] tablet:mt-[38px] tablet:mb-[37px] tablet:text-[16px] pc:mt-[33px] pc:mb-[0]"
          >
            <p className="w-[150px] h-[40px] flex items-center justify-center bg-[var(--color-main)] tablet:w-[226px] tablet:h-[55px]">
              최애 찾으러 가기
            </p>
          </Link>
          <figure className="relative -px-[60px] w-[calc(100%+120px)] h-[199px] overflow-visible tablet:h-[352px] pc:h-[765px]">
            <Image
              className="absolute object-contain"
              src={"/images/landing/landing1.svg"}
              fill
              alt="랜딩 페이지 최애 포토 바로 가기"
            />
          </figure>
        </section>
      </div>

      <section className="bg-landing2 w-full h-[440px] tablet:h-[707px] pc:h-[800px]" />
      <section className="bg-landing3 w-full h-[440px] tablet:h-[776px] pc:h-[800px]" />
      <section className="bg-landing4 w-full h-[440px] tablet:h-[667px] pc:h-[900px]" />
    </div>
  );
}
