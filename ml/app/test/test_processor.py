from app.services.audio_processor import AudioProcessor
import os

SAMPLE = "ml/tests/sample_audio/sample.wav"

def test_full_pipeline():
    assert os.path.exists(SAMPLE)

    processor = AudioProcessor()

    result = processor.process(SAMPLE)

    assert "language" in result
    assert "confidence" in result
    assert "transcript" in result
    assert "embedding" in result
    assert "cluster_id" in result

    assert isinstance(result["language"], str)
    assert 0 <= result["confidence"] <= 1
    assert isinstance(result["embedding"], list)
