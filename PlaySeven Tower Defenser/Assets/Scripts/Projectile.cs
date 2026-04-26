using UnityEngine;

public class Projectile : MonoBehaviour
{
    public float speed = 15f;
    public float hitDistance = 0.25f;

    private Enemy target;
    private int damage;

    public void SetTarget(Enemy enemy, int projectileDamage)
    {
        target = enemy;
        damage = projectileDamage;
    }

    void Update()
    {
        if (target == null)
        {
            Destroy(gameObject);
            return;
        }

        MoveToTarget();
    }

    void MoveToTarget()
    {
        Vector3 targetPosition = target.transform.position + Vector3.up * 0.5f;

        transform.position = Vector3.MoveTowards(
            transform.position,
            targetPosition,
            speed * Time.deltaTime
        );

        transform.LookAt(targetPosition);

        if (Vector3.Distance(transform.position, targetPosition) <= hitDistance)
        {
            target.TakeDamage(damage);
            Destroy(gameObject);
        }
    }
}
