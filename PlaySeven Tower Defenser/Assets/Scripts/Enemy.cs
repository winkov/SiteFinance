using UnityEngine;

public class Enemy : MonoBehaviour
{
    public float speed = 3f;
    public int maxHealth = 100;
    public int goldValue = 10;
    public int castleDamage = 1;

    private int currentHealth;
    private int currentWaypointIndex;
    private WaypointPath waypointPath;
    private WaveManager waveManager;

    void Start()
    {
        currentHealth = maxHealth;
        currentWaypointIndex = 0;

        waypointPath = FindFirstObjectByType<WaypointPath>();
        waveManager = FindFirstObjectByType<WaveManager>();
    }

    void Update()
    {
        if (waypointPath == null || waypointPath.Count == 0)
        {
            return;
        }

        MoveAlongPath();
    }

    void MoveAlongPath()
    {
        Transform targetWaypoint = waypointPath.GetWaypoint(currentWaypointIndex);

        if (targetWaypoint == null)
        {
            return;
        }

        transform.position = Vector3.MoveTowards(
            transform.position,
            targetWaypoint.position,
            speed * Time.deltaTime
        );

        float distanceToWaypoint = Vector3.Distance(transform.position, targetWaypoint.position);

        if (distanceToWaypoint <= 0.05f)
        {
            currentWaypointIndex++;

            if (currentWaypointIndex >= waypointPath.Count)
            {
                ReachEndOfPath();
            }
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

    void ReachEndOfPath()
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
