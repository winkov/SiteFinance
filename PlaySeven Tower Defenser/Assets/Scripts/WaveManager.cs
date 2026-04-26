using System.Collections;
using UnityEngine;

public class WaveManager : MonoBehaviour
{
    public GameObject enemyPrefab;
    public Transform spawnPoint;
    public int[] enemiesPerWave = { 5, 10, 15, 20 };
    public float spawnDelay = 1f;
    public float enemyHealthMultiplierPerWave = 1.25f;
    public float enemySpeedBonusPerWave = 0.15f;

    private int currentWave = 0;
    private int aliveEnemies = 0;
    private bool waveRunning = false;
    private BonusSystem bonusSystem;
    private UIManager uiManager;

    public int CurrentWaveDisplay { get { return currentWave + 1; } }
    public bool WaveRunning { get { return waveRunning; } }

    void Start()
    {
        bonusSystem = FindFirstObjectByType<BonusSystem>();
        uiManager = FindFirstObjectByType<UIManager>();
        RefreshUI();
    }

    public void StartNextWave()
    {
        if (waveRunning) return;
        if (GameManager.Instance != null && GameManager.Instance.IsGameOver) return;
        if (currentWave >= enemiesPerWave.Length) return;

        StartCoroutine(SpawnWave(enemiesPerWave[currentWave]));
    }

    IEnumerator SpawnWave(int enemyCount)
    {
        waveRunning = true;
        aliveEnemies = enemyCount;
        RefreshUI();

        for (int i = 0; i < enemyCount; i++)
        {
            if (enemyPrefab != null && spawnPoint != null)
            {
                GameObject enemyObject = Instantiate(enemyPrefab, spawnPoint.position, Quaternion.identity);
                Enemy enemy = enemyObject.GetComponent<Enemy>();
                ScaleEnemyForWave(enemy);
            }

            yield return new WaitForSeconds(spawnDelay);
        }
    }

    void ScaleEnemyForWave(Enemy enemy)
    {
        if (enemy == null) return;

        float waveMultiplier = Mathf.Pow(enemyHealthMultiplierPerWave, currentWave);
        enemy.maxHealth = Mathf.RoundToInt(enemy.maxHealth * waveMultiplier);
        enemy.speed += enemySpeedBonusPerWave * currentWave;
        enemy.goldValue += currentWave * 2;
    }

    public void NotifyEnemyRemoved()
    {
        if (!waveRunning) return;

        aliveEnemies--;
        if (aliveEnemies <= 0)
        {
            FinishWave();
        }
    }

    void FinishWave()
    {
        waveRunning = false;
        currentWave++;

        if (bonusSystem != null)
        {
            bonusSystem.ApplyBonus();
        }

        RefreshUI();
    }

    void RefreshUI()
    {
        if (uiManager != null)
        {
            uiManager.UpdateWave(CurrentWaveDisplay);
            uiManager.UpdateStartWaveButton(waveRunning, currentWave >= enemiesPerWave.Length);
        }
    }
}
