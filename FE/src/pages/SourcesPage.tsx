import InfoPageLayout, { InfoSection } from '../components/InfoPageLayout';
import { usePageMeta } from '../hooks/usePageMeta';

export default function SourcesPage() {
  usePageMeta('정보 출처', 'FishNote 생선·제철·맛 정보의 검수 기준과 출처를 안내합니다.');

  return (
    <InfoPageLayout
      eyebrow="정보를 다루는 원칙"
      title="정보 출처"
      description="제철은 산지, 수온, 유통 방식에 따라 달라질 수 있습니다. FishNote는 하나의 정답처럼 단정하지 않고 공공기관 자료와 시장 정보를 교차 확인합니다."
    >
      <InfoSection title="우선 참고하는 자료">
        <ul>
          <li>국립수산과학원·국가생물종목록: 표준명, 학명, 생태 정보</li>
          <li>해양수산부 ‘이달의 수산물’: 월별 권장 수산물과 계절 정보</li>
          <li>공공데이터포털·수산시장 공개 자료: 유통 시기와 가격 흐름 보조 확인</li>
          <li>노량진수산시장 및 상회 시세: 실제 유통 현황 참고</li>
        </ul>
      </InfoSection>

      <InfoSection title="현재 검수 상태">
        <p>
          광어·방어·연어·가숭어·숭어는 2026년 7월 10일 1차 교차 검수를 반영했습니다.
          나머지 어종은 순차적으로 추가 검수 중이며, 검수가 완료되지 않은 정보는 공통적으로 알려진 범위를 바탕으로 작성되어 있습니다.
        </p>
      </InfoSection>

      <InfoSection title="표현과 사진 원칙">
        <ul>
          <li>제철 월과 학명 같은 사실은 출처를 확인하고, 설명 문장은 FishNote가 직접 작성합니다.</li>
          <li>사진은 이용 조건을 확인한 자료 또는 직접 촬영한 이미지만 사용합니다.</li>
          <li>어종을 오인할 가능성이 있는 이미지는 사진 대신 중립적인 표시를 사용합니다.</li>
        </ul>
      </InfoSection>

      <InfoSection title="정보 제보">
        <p>표준명 혼동이나 제철 정보 오류를 발견했을 때 제보할 수 있는 문의 채널을 준비 중입니다. 출처를 함께 남길 수 있는 형태로 제공할 예정입니다.</p>
      </InfoSection>
    </InfoPageLayout>
  );
}
