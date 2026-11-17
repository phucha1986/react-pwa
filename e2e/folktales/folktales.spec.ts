import { expect, test } from '@playwright/test';

test.describe('truyện cổ tích folktales', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/Folktales');
    await page.waitForLoadState('networkidle');
  });

  test('the page is a grid of story icon tiles', async ({ page }) => {
    await expect(page.getByTestId('folktales-page')).toBeVisible();
    expect(await page.locator('[data-pw^="folktales-story-"]').count()).toBe(10);
  });

  test('stories with narration show their title, no Play button until pressed', async ({
    page,
  }) => {
    await expect(page.getByTestId('folktales-title-bamboo')).toContainText('Cây Tre Trăm Đốt');
    await expect(page.getByTestId('folktales-title-thanh-giong')).toContainText('Thánh Gióng');
    await expect(page.getByTestId('folktales-title-dua-hau')).toContainText('Sự Tích Mai An Tiêm');
    await expect(page.getByTestId('folktales-title-ho-guom')).toContainText('Sự Tích Hồ Hoàn Kiếm');
    await expect(page.getByTestId('folktales-title-de-men')).toContainText('Dế Mèn Phiêu Lưu Ký');
    await expect(page.getByTestId('folktales-play-bamboo')).toHaveCount(0);
    await expect(page.getByTestId('folktales-play-thanh-giong')).toHaveCount(0);
    await expect(page.getByTestId('folktales-play-dua-hau')).toHaveCount(0);
    await expect(page.getByTestId('folktales-play-ho-guom')).toHaveCount(0);
    await expect(page.getByTestId('folktales-play-de-men')).toHaveCount(0);
    await expect(page.getByTestId('folktales-audio-bamboo')).toHaveCount(1);
    await expect(page.getByTestId('folktales-audio-thanh-giong')).toHaveCount(1);
    await expect(page.getByTestId('folktales-audio-dua-hau')).toHaveCount(1);
    await expect(page.getByTestId('folktales-audio-ho-guom')).toHaveCount(1);
    await expect(page.getByTestId('folktales-audio-de-men')).toHaveCount(1);
  });

  test('the first press reveals a semi-transparent Play button', async ({ page }) => {
    await page
      .getByTestId('folktales-story-bamboo')
      .evaluate((el) => (el.querySelector('.MuiPaper-root') as HTMLElement).click());
    await expect(page.getByTestId('folktales-play-bamboo')).toBeVisible();
    await expect(page.getByTestId('folktales-play-bamboo')).toHaveCSS('opacity', '0.5');
  });

  test('stories without narration show only the icon', async ({ page }) => {
    await expect(page.getByTestId('folktales-title-tam-cam')).toHaveCount(0);
    await expect(page.getByTestId('folktales-play-tam-cam')).toHaveCount(0);
    await expect(page.getByTestId('folktales-play-son-tinh')).toHaveCount(0);
  });

  test('the cricket tile opens the Dế Mèn chapter screen', async ({ page }) => {
    await page
      .getByTestId('folktales-story-de-men')
      .evaluate((el) => (el.querySelector('.MuiPaper-root') as HTMLElement).click());
    await expect(page.getByTestId('demen-chapters-page')).toBeVisible();
    await expect(page.getByTestId('demen-chapters-title')).toContainText('Dế Mèn Phiêu Lưu Ký');
    expect(await page.getByTestId(/^demen-chapter-\d+$/).count()).toBe(6);
  });

  test('chapter titles are always in Vietnamese', async ({ page }) => {
    await page.goto('/Folktales/DemenChapters');
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('demen-chapter-label-1')).toContainText('Chương 1');
    await expect(page.getByTestId('demen-chapter-title-1')).toContainText(
      'Tôi sống độc lập từ thuở bé - Một sự ngỗ nghịch đáng ân hận suốt đời',
    );
    await expect(page.getByTestId('demen-chapter-label-2')).toContainText('Chương 2');
    await expect(page.getByTestId('demen-chapter-title-2')).toContainText(
      'Cuộc phiêu lưu bất ngờ - Làm đồ chơi cho trẻ con mà không biết - Lại anh Xiến Tóc cho tôi một bài học',
    );
    await expect(page.getByTestId('demen-chapter-label-4')).toContainText('Chương 4');
    await expect(page.getByTestId('demen-chapter-title-4')).toContainText(
      'Ông anh cả và ông anh hai của Mèn - Tri âm không đợi mà gặp',
    );
    await expect(page.getByTestId('demen-chapter-label-6')).toContainText('Chương 6');
    await expect(page.getByTestId('demen-chapter-title-6')).toContainText(
      'Tranh hùng với võ sĩ Bọ Ngựa - Chánh phó thủ lĩnh Châu Chấu - Thề rằng sinh tử có nhau',
    );
    await expect(page.getByTestId('demen-chapter-label-10')).toContainText('Chương 10');
    await expect(page.getByTestId('demen-chapter-title-10')).toContainText(
      'Mấy dòng tạm biệt của tập ký',
    );
    await expect(page.getByTestId('demen-chapter-5')).toHaveCount(0);
  });

  test('a chapter button plays and pauses that chapter', async ({ page }) => {
    await page.goto('/Folktales/DemenChapters');
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('demen-chapter-1')).toBeVisible();
    await page.getByTestId('demen-chapter-1').click();
    await expect(page.getByTestId('demen-chapter-playing-1')).toBeVisible();
    await page.getByTestId('demen-chapter-1').click();
    await expect(page.getByTestId('demen-chapter-playing-1')).toHaveCount(0);
  });

  test('the home menu has the bamboo tile that opens the folktales', async ({ page }) => {
    await page.goto('/');
    await page.getByAltText('Folktales').click();
    await expect(page.getByTestId('folktales-page')).toBeVisible();
  });

  test('no horizontal overflow on a phone viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBe(0);
  });
});
