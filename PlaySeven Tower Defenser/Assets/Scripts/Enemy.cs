using UnityEngine;

public class Enemy : MonoBehaviour
{
    public float speed = 3f;
    public int maxHealth = 100;
    public int goldValue = 10;
    public int castleDamage = 1;

    private int currentHealth;
    private int currentWaypointIndex = 0;
    private WaypointPath path;
    private WaveManager waveManager;

    public int CurrentHealth { get { return currentHealth; } }

    void Start()
    {
        currentHealth = maxHealth;
        path = FindObjectOfType<WaypointPath>();
        waveManager = FindObjectOfType<WaveManager>();

        if (path != null && path.Count > 0)
        {
            transform.position = path.GetWaypoint(0).position;
            currentWaypointIndex = 1;
        }
    }

    void Update()
    {
        if (GameManager.Instance != null && GameManager.Instance.IsGameOver) return;
        if (path == null || path.Count == 0) return;

        if (currentWaypointIndex >= path.Count)
        {
            ReachCastle();
            return;
        }

        Transform targetWaypoint = path.GetWaypoint(currentWaypointIndex);
        Vector3 direction = (targetWaypoint.position - transform.position).normalized;
        transform.position += direction * speed * Time.deltaTime;

        if (Vector3.Distance(transform.position, targetWaypoint.position) < 0.1f)
        {
            currentWaypointIndex++;
        }
    }

    public void TakeDamage(int damage)
    {
        currentHealth -= damage;
        if (currentHealth <= 0)
        {
            Die(true);
        }
    }

    void ReachCastle()
    {
        if (GameManager.Instance != null)
        {
            GameManager.Instance.DamageCastle(castleDamage);
        }

        Die(false);
    }

    void Die(bool giveGold)
    {
        if (giveGold && GameManager.Instance != null)
        {
            GameManager.Instance.AddGold(goldValue);
        }

        if (waveManager != null)
        {
            waveManager.NotifyEnemyRemoved();
        }

        Destroy(gameObject);
    }
}
