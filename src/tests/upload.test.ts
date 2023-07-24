import { isNotNullOrUndefined, getPercentage, convertStatusToString, ChunkStatus, wait, createParams } from '../hooks/useUpload';

describe('Testing useUpload Module and its functions', () => {
  test('isNotNullOrUndefined should return correct boolean', () => {
    expect(isNotNullOrUndefined(null)).toBe(false);
    expect(isNotNullOrUndefined(undefined)).toBe(false);
    expect(isNotNullOrUndefined("")).toBe(true);
    expect(isNotNullOrUndefined("test")).toBe(true);
    expect(isNotNullOrUndefined(0)).toBe(true);
    expect(isNotNullOrUndefined(1)).toBe(true);
  })

  test('getPercentage should return correct percentage', () => {
    expect(getPercentage(2, 4)).toBe(50);
    expect(getPercentage(1, 4)).toBe(25);
    expect(getPercentage(3, 4)).toBe(75);
    expect(getPercentage(4, 4)).toBe(100);
    expect(getPercentage(2, 5)).toBe(40);
  })

  test("Converting ChunkStatus to String should return correct string", () => {
    expect(convertStatusToString(ChunkStatus.SUCCESS)).toBe("Success");
    expect(convertStatusToString(ChunkStatus.FAILED)).toBe("Failed");
    expect(convertStatusToString(ChunkStatus.RETRYING)).toBe("Retrying");
    expect(convertStatusToString(ChunkStatus.UPLOADING)).toBe("Uploading");
  })

  test("Wait should resolve after its timer", async () => {
    let start = Date.now();
    await wait(100);

    let end = Date.now();
    expect(end - start).toBeGreaterThanOrEqual(100);
  })

  test("Created Params should be the same", async () => {
    const params = new URLSearchParams();
    params.append("chunkNumber", "1");
    params.append("totalChunks", "2");
    params.append("fileName", "test");
    params.append("fileSize", "100");
    params.append("fileType", "test");
    params.append("fileId", "test");

    const options = {
      chunkNumber: "1",
      totalChunks: "2",
      fileName: "test",
      fileSize: "100",
      fileType: "test",
      fileId: "test"
    };

    const createdParams = createParams(options);

    expect(createdParams.toString()).toBe(params.toString());
  })
})