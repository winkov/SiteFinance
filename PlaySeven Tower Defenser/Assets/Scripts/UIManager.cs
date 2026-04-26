using UnityEngine;
using UnityEngine.UI;

public class UIManager : MonoBehaviour
{
    public Text goldText;
    public Text castleHealthText;
    public Text waveText;
    public Text messageText;
    public Button startWaveButton;
    public Button buildTowerButton;

    private WaveManager waveManager;
    private BuildManager buildManager;

    void Start()
    {
        waveManager = FindObjectOfType<WaveManager>();
        buildManager = FindObjectOfType<BuildManager>();

        if (startWaveButton != null)
        {
            startWaveButton.onClick.AddListener(StartWave);
        }

        if (buildTowerButton != null)
        {
            buildTowerButton.onClick.AddListener(ToggleBuildMode);
        }
    }

    public void UpdateGold(int gold)
    {
        if (goldText != null)
        {
            goldText.text = "Gold: " + gold;
        }
    }

    public void UpdateCastleHealth(int health, int maxHealth)
    {
        if (castleHealthText != null)
        {
            castleHealthText.text = "Castle HP: " + health + "/" + maxHealth;
        }
    }

    public void UpdateWave(int wave)
    {
        if (waveText != null)
        {
            waveText.text = "Wave: " + wave;
        }
    }

    public void UpdateBuildMode(bool active)
    {
        if (buildTowerButton != null)
        {
            Text buttonText = buildTowerButton.GetComponentInChildren<Text>();
            if (buttonText != null)
            {
                buttonText.text = active ? "Cancel Build" : "Build Tower";
            }
        }

        ShowMessage(active ? "Tap a build spot" : "");
    }

    public void UpdateStartWaveButton(bool waveRunning, bool allWavesFinished)
    {
        if (startWaveButton == null) return;

        startWaveButton.interactable = !waveRunning && !allWavesFinished;
        Text buttonText = startWaveButton.GetComponentInChildren<Text>();
        if (buttonText != null)
        {
            buttonText.text = allWavesFinished ? "Victory" : waveRunning ? "Wave Running" : "Start Wave";
        }
    }

    public void UpdateGameOver(bool gameOver)
    {
        if (gameOver)
        {
            ShowMessage("Game Over");
        }
    }

    void StartWave()
    {
        if (waveManager != null)
        {
            waveManager.StartNextWave();
        }
    }

    void ToggleBuildMode()
    {
        if (buildManager != null)
        {
            buildManager.ToggleBuildMode();
        }
    }

    void ShowMessage(string message)
    {
        if (messageText != null)
        {
            messageText.text = message;
        }
    }
}
